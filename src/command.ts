import * as path from 'path'
import * as vscode from 'vscode'

function relativePath(uri: vscode.Uri) {
    const dir = vscode.workspace.getWorkspaceFolder(uri)
    if (!dir) {
        return undefined
    }
    return path.relative(dir.uri.path, uri.path)
}

export function copyLine(editor: vscode.TextEditor) {
    const docUri = editor.document.uri
    const relPath = relativePath(docUri)
    if (!relPath) {
        return
    }
    const selection = editor.selection
    const startLine = selection.start.line + 1
    const endLine = selection.end.line + 1
    if (startLine === endLine) {
        const link = relPath + `#L${startLine}`
        vscode.env.clipboard.writeText(link)
    } else {
        const link = relPath + `#L${startLine}-${endLine}`
        vscode.env.clipboard.writeText(link)
    }
}
