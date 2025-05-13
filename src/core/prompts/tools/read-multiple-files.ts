import { ToolArgs } from "./types"

export function getReadMultipleFilesDescription(args: ToolArgs): string {
	return `## read_multiple_files
Description: Request to read the contents of multiple files at once. Use this when you need to examine the contents of multiple existing files simultaneously, for example to compare code across files, analyze related configuration files, or get a broader view of a codebase. The output includes each file's content with line numbers prefixed to each line (e.g. "1 | const x = 1"), making it easier to reference specific lines when creating diffs or discussing code. Each file is processed according to the same rules as the read_file tool, with large files being truncated to a reasonable size. Automatically extracts raw text from PDF and DOCX files. May not be suitable for other types of binary files, as it returns the raw content as a string.
Parameters:
- paths: (required) A comma-separated list of file paths to read (relative to the current workspace directory ${args.cwd})
Usage:
<read_multiple_files>
<paths>File path 1, File path 2, File path 3</paths>
</read_multiple_files>

Examples:

1. Reading multiple configuration files:
<read_multiple_files>
<paths>frontend-config.json, backend-config.json, database-config.json</paths>
</read_multiple_files>

2. Reading related source files:
<read_multiple_files>
<paths>src/components/Header.js, src/components/Footer.js, src/components/Sidebar.js</paths>
</read_multiple_files>

3. Comparing implementation files with test files:
<read_multiple_files>
<paths>src/utils/formatter.ts, tests/utils/formatter.test.ts</paths>
</read_multiple_files>

Note: This tool efficiently processes multiple files in a single request, making it convenient for tasks that require examining multiple related files at once. Each file is subject to the same size limitations as the read_file tool, with large files being truncated to show only the first portion of the file.`
}
