import path from "path"
import { isBinaryFile } from "isbinaryfile"

import { Task } from "../task/Task"
import { ClineSayTool } from "../../shared/ExtensionMessage"
import { formatResponse } from "../prompts/responses"
import { ToolUse, AskApproval, HandleError, PushToolResult, RemoveClosingTag } from "../../shared/tools"
import { RecordSource } from "../context-tracking/FileContextTrackerTypes"
import { isPathOutsideWorkspace } from "../../utils/pathUtils"
import { countFileLines } from "../../integrations/misc/line-counter"
import { readLines } from "../../integrations/misc/read-lines"
import { extractTextFromFile, addLineNumbers } from "../../integrations/misc/extract-text"
import { parseSourceCodeDefinitionsForFile } from "../../services/tree-sitter"

export async function readMultipleFilesTool(
	cline: Task,
	block: ToolUse,
	askApproval: AskApproval,
	handleError: HandleError,
	pushToolResult: PushToolResult,
	removeClosingTag: RemoveClosingTag,
) {
	const pathsStr: string | undefined = block.params.paths
	
	// Parse the paths parameter (expected to be a comma-separated list of file paths)
	const relPaths = pathsStr ? removeClosingTag("paths", pathsStr).split(",").map(p => p.trim()) : []

	// Create a container for all file results
	let allFilesResult = "<files>\n"
	
	// Flag to track if any file is outside workspace
	let hasOutsideWorkspaceFile = false

	// Check if we have paths to process
	if (block.partial) {
		const partialMessage = JSON.stringify({ tool: "readFile", content: undefined } satisfies ClineSayTool)
		await cline.ask("tool", partialMessage, block.partial).catch(() => {})
		return
	} else {
		if (!pathsStr || relPaths.length === 0) {
			cline.consecutiveMistakeCount++
			cline.recordToolError("read_file")
			const errorMsg = await cline.sayAndCreateMissingParamError("read_file", "paths")
			pushToolResult(`<files><e>${errorMsg}</e></files>`)
			return
		}

		// Get the provider state for max lines setting
		const { maxReadFileLine = 500 } = (await cline.providerRef.deref()?.getState()) ?? {}

		// Check if any file is outside workspace
		const outsideWorkspaceFiles = relPaths
			.map(relPath => ({ 
				relPath, 
				fullPath: relPath ? path.resolve(cline.cwd, relPath) : "",
				isOutsideWorkspace: relPath ? isPathOutsideWorkspace(path.resolve(cline.cwd, relPath)) : false
			}))
			.filter(file => file.isOutsideWorkspace)
			.map(file => file.relPath)

		if (outsideWorkspaceFiles.length > 0) {
			hasOutsideWorkspaceFile = true
		}

		// Create approval message
		const fileCount = relPaths.length
		// Create a custom message for approval that includes file count and paths
		const approvalMessage = JSON.stringify({
			tool: "readFile",
			path: relPaths.length > 0 ? relPaths[0] : "", // Use the first path as the main path
			content: `Reading ${fileCount} files: ${relPaths.join(", ")}`,
			isOutsideWorkspace: hasOutsideWorkspaceFile,
		} satisfies ClineSayTool)

		// Ask for approval
		const approved = await askApproval("tool", approvalMessage)
		if (!approved) {
			return
		}

		// Process each file
		for (const relPath of relPaths) {
			try {
				// Get the full path
				const fullPath = relPath ? path.resolve(cline.cwd, relPath) : ""
				
				// Check if access is allowed
				const accessAllowed = cline.rooIgnoreController?.validateAccess(relPath)
				if (!accessAllowed) {
					await cline.say("rooignore_error", relPath)
					const errorMsg = formatResponse.rooIgnoreError(relPath)
					allFilesResult += `<file><path>${relPath}</path><e>${errorMsg}</e></file>\n`
					continue
				}

				// Check if file exists
				let absolutePath: string
				try {
					// Use the fullPath directly instead of getAbsolutePath
					absolutePath = fullPath
					// Check if file exists by trying to access it
					await countFileLines(absolutePath).catch(() => {
						throw new Error(`File not found: ${relPath}`)
					})
				} catch (error) {
					cline.consecutiveMistakeCount++
					// Use "read_file" as the tool error type since it's in the same category
					cline.recordToolError("read_file")
					const errorMsg = `File not found: ${relPath}`
					allFilesResult += `<file><path>${relPath}</path><e>${errorMsg}</e></file>\n`
					continue
				}

				// Count total lines in the file
				const totalLines = await countFileLines(absolutePath).catch(() => 0)

				// Read file content
				let content: string
				let isFileTruncated = false
				let sourceCodeDef = ""

				const isBinary = await isBinaryFile(absolutePath).catch(() => false)

				if (!isBinary && maxReadFileLine >= 0 && totalLines > maxReadFileLine) {
					// If file is too large, only read the first maxReadFileLine lines
					isFileTruncated = true

					const res = await Promise.all([
						maxReadFileLine > 0 ? readLines(absolutePath, maxReadFileLine - 1, 0) : "",
						(async () => {
							try {
								return await parseSourceCodeDefinitionsForFile(absolutePath, cline.rooIgnoreController)
							} catch (error) {
								if (error instanceof Error && error.message.startsWith("Unsupported language:")) {
									console.warn(`[read_multiple_files] Warning: ${error.message}`)
									return undefined
								} else {
									console.error(
										`[read_multiple_files] Unhandled error: ${error instanceof Error ? error.message : String(error)}`,
									)
									return undefined
								}
							}
						})(),
					])

					content = res[0].length > 0 ? addLineNumbers(res[0]) : ""
					const result = res[1]

					if (result) {
						sourceCodeDef = `${result}`
					}
				} else {
					// Read entire file
					content = await extractTextFromFile(absolutePath)
				}

				// Create variables to store XML components
				let xmlInfo = ""
				let contentTag = ""

				// Add truncation notice if applicable
				if (isFileTruncated) {
					xmlInfo += `<notice>Showing only ${maxReadFileLine} of ${totalLines} total lines.</notice>\n`

					// Add source code definitions if available
					if (sourceCodeDef) {
						xmlInfo += `<list_code_definition_names>${sourceCodeDef}</list_code_definition_names>\n`
					}
				}

				// Empty files (zero lines)
				if (content === "" && totalLines === 0) {
					// Always add self-closing content tag and notice for empty files
					contentTag = `<content/>`
					xmlInfo += `<notice>File is empty</notice>\n`
				}
				// maxReadFileLine=0 for non-range reads
				else if (maxReadFileLine === 0) {
					// Skip content tag for maxReadFileLine=0 (definitions only mode)
					contentTag = ""
				}
				// Normal case: non-empty files with content
				else {
					// For non-range reads, always show line range
					let lines = totalLines

					if (maxReadFileLine >= 0 && totalLines > maxReadFileLine) {
						lines = maxReadFileLine
					}

					const lineRangeAttr = ` lines="1-${lines}"`

					// Maintain exact format expected by tests
					contentTag = `<content${lineRangeAttr}>\n${content}</content>\n`
				}

				// Track file read operation
				if (relPath) {
					await cline.getFileContextTracker().trackFileContext(relPath, "read_tool" as RecordSource)
				}

				// Add this file's result to the combined result
				allFilesResult += `<file><path>${relPath}</path>\n${contentTag}${xmlInfo}</file>\n`
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error)
				allFilesResult += `<file><path>${relPath || ""}</path><e>Error reading file: ${errorMsg}</e></file>\n`
				await handleError("reading file", error instanceof Error ? error : new Error(String(error)))
			}
		}

		// Close the files container
		allFilesResult += "</files>"
		
		// Push the combined result
		pushToolResult(allFilesResult)
	}
}
