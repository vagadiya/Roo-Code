// npx jest src/core/tools/__tests__/readMultipleFilesTool.test.ts

import fs from "fs"
import path from "path"
import { ReadMultipleFilesToolUse, ToolParamName } from "../../../shared/tools"
import { readMultipleFilesTool } from "../readMultipleFilesTool"

// Mock dependencies
jest.mock("fs")
jest.mock("path")
jest.mock("isbinaryfile")
jest.mock("../../../utils/pathUtils")
jest.mock("../../../integrations/misc/line-counter")
jest.mock("../../../integrations/misc/read-lines")
jest.mock("../../../integrations/misc/extract-text")
jest.mock("../../../services/tree-sitter")

describe("readMultipleFilesTool", () => {
	const mockCwd = "/mock/cwd"
	const mockFilePath1 = "file1.txt"
	const mockFilePath2 = "file2.txt"
	const mockAbsolutePath1 = path.resolve(mockCwd, mockFilePath1)
	const mockAbsolutePath2 = path.resolve(mockCwd, mockFilePath2)
	const mockFileContent1 = "This is file 1 content"
	const mockFileContent2 = "This is file 2 content"

	// Mock implementations
	const mockFs = fs as jest.Mocked<typeof fs>
	const mockPath = path as jest.Mocked<typeof path>
	
	// Setup mocks
	beforeEach(() => {
		jest.clearAllMocks()
		
		// Mock path.resolve
		mockPath.resolve.mockImplementation((cwd, filePath) => {
			if (filePath === mockFilePath1) return mockAbsolutePath1
			if (filePath === mockFilePath2) return mockAbsolutePath2
			return path.join(cwd, filePath)
		})
		
		// Mock fs.existsSync
		mockFs.existsSync.mockImplementation((filePath) => {
			return filePath === mockAbsolutePath1 || filePath === mockAbsolutePath2
		})
		
		// Mock fs.readFileSync
		mockFs.readFileSync.mockImplementation((filePath) => {
			if (filePath === mockAbsolutePath1) return Buffer.from(mockFileContent1)
			if (filePath === mockAbsolutePath2) return Buffer.from(mockFileContent2)
			return Buffer.from("")
		})
		
		// Mock countFileLines
		const countFileLines = require("../../../integrations/misc/line-counter").countFileLines
		countFileLines.mockResolvedValue(5)
		
		// Mock extractTextFromFile
		const extractTextFromFile = require("../../../integrations/misc/extract-text").extractTextFromFile
		extractTextFromFile.mockImplementation(async (filePath: string) => {
			if (filePath === mockAbsolutePath1) return mockFileContent1
			if (filePath === mockAbsolutePath2) return mockFileContent2
			return ""
		})
		
		// Mock addLineNumbers
		const addLineNumbers = require("../../../integrations/misc/extract-text").addLineNumbers
		addLineNumbers.mockImplementation((content: string) => {
			return content.split("\n").map((line: string, i: number) => `${i + 1} | ${line}`).join("\n")
		})
		
		// Mock isPathOutsideWorkspace
		const isPathOutsideWorkspace = require("../../../utils/pathUtils").isPathOutsideWorkspace
		isPathOutsideWorkspace.mockReturnValue(false)
	})
	
	async function executeReadMultipleFilesTool(
		paths = `${mockFilePath1},${mockFilePath2}`,
		askApprovalReturnValue = true,
		params: Partial<ReadMultipleFilesToolUse["params"]> = {},
	) {
		const mockCline = {
			cwd: mockCwd,
			consecutiveMistakeCount: 0,
			recordToolError: jest.fn().mockReturnValue(undefined),
			sayAndCreateMissingParamError: jest.fn().mockResolvedValue("Missing parameter"),
			say: jest.fn().mockResolvedValue(undefined),
			ask: jest.fn().mockResolvedValue(undefined),
			providerRef: {
				deref: jest.fn().mockReturnValue({
					getState: jest.fn().mockResolvedValue({
						maxReadFileLine: 500,
					}),
				}),
			},
			rooIgnoreController: {
				validateAccess: jest.fn().mockReturnValue(true),
			},
			getFileContextTracker: jest.fn().mockReturnValue({
				trackFileContext: jest.fn().mockResolvedValue(undefined),
			}),
		}
		
		const toolUse: ReadMultipleFilesToolUse = {
			type: "tool_use",
			name: "read_multiple_files",
			params: {
				paths,
				...params,
			},
			partial: false,
		}
		
		const askApproval = jest.fn().mockResolvedValue(askApprovalReturnValue)
		const handleError = jest.fn().mockResolvedValue(undefined)
		const pushToolResult = jest.fn()
		const removeClosingTag = jest.fn().mockImplementation((tag: ToolParamName, content?: string) => content || "")
		
		await readMultipleFilesTool(
			mockCline as any,
			toolUse,
			askApproval,
			handleError,
			pushToolResult,
			removeClosingTag,
		)
		
		return {
			mockCline,
			askApproval,
			handleError,
			pushToolResult,
			removeClosingTag,
		}
	}
	
	it("should read multiple files and return their contents", async () => {
		const { pushToolResult } = await executeReadMultipleFilesTool()
		
		expect(pushToolResult).toHaveBeenCalledTimes(1)
		const result = pushToolResult.mock.calls[0][0] as string
		
		// Check that the result contains both files
		expect(result).toContain(`<file><path>${mockFilePath1}</path>`)
		expect(result).toContain(`<file><path>${mockFilePath2}</path>`)
		expect(result).toContain(mockFileContent1)
		expect(result).toContain(mockFileContent2)
	})
	
	it("should handle missing paths parameter", async () => {
		const { pushToolResult } = await executeReadMultipleFilesTool("")
		
		expect(pushToolResult).toHaveBeenCalledTimes(1)
		const result = pushToolResult.mock.calls[0][0] as string
		
		expect(result).toContain("<files><e>Missing parameter</e></files>")
	})
	
	it("should handle user rejection", async () => {
		const { pushToolResult } = await executeReadMultipleFilesTool(
			`${mockFilePath1},${mockFilePath2}`,
			false
		)
		
		expect(pushToolResult).not.toHaveBeenCalled()
	})
	
	it("should handle file access errors", async () => {
		const mockCline = {
			cwd: mockCwd,
			consecutiveMistakeCount: 0,
			recordToolError: jest.fn().mockReturnValue(undefined),
			sayAndCreateMissingParamError: jest.fn().mockResolvedValue("Missing parameter"),
			say: jest.fn().mockResolvedValue(undefined),
			ask: jest.fn().mockResolvedValue(undefined),
			providerRef: {
				deref: jest.fn().mockReturnValue({
					getState: jest.fn().mockResolvedValue({
						maxReadFileLine: 500,
					}),
				}),
			},
			rooIgnoreController: {
				validateAccess: jest.fn().mockImplementation((path) => {
					return path !== mockFilePath2 // Deny access to the second file
				}),
			},
			getFileContextTracker: jest.fn().mockReturnValue({
				trackFileContext: jest.fn().mockResolvedValue(undefined),
			}),
		}
		
		const toolUse: ReadMultipleFilesToolUse = {
			type: "tool_use",
			name: "read_multiple_files",
			params: {
				paths: `${mockFilePath1},${mockFilePath2}`,
			},
			partial: false,
		}
		
		const askApproval = jest.fn().mockResolvedValue(true)
		const handleError = jest.fn().mockResolvedValue(undefined)
		const pushToolResult = jest.fn()
		const removeClosingTag = jest.fn().mockImplementation((tag: ToolParamName, content?: string) => content || "")
		
		await readMultipleFilesTool(
			mockCline as any,
			toolUse,
			askApproval,
			handleError,
			pushToolResult,
			removeClosingTag,
		)
		
		expect(pushToolResult).toHaveBeenCalledTimes(1)
		const result = pushToolResult.mock.calls[0][0] as string
		
		// First file should be read successfully
		expect(result).toContain(`<file><path>${mockFilePath1}</path>`)
		expect(result).toContain(mockFileContent1)
		
		// Second file should have an error
		expect(result).toContain(`<file><path>${mockFilePath2}</path><e>`)
		expect(mockCline.say).toHaveBeenCalledWith("rooignore_error", mockFilePath2)
	})
})
