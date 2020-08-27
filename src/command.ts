import * as path from 'path'
import * as vscode from 'vscode'

function relativePath(uri: vscode.Uri) {
    const dir = vscode.workspace.getWorkspaceFolder(uri)
    if (!dir) {
        return undefined
    }
    return path.relative(dir.uri.path, uri.path)
}

export async function copyLine(editor: vscode.TextEditor) {
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
        return await vscode.env.clipboard.writeText(link)
    } else {
        const link = relPath + `#L${startLine}-${endLine}`
        return await vscode.env.clipboard.writeText(link)
    }
}

export async function pasteSnippet(snippet: string, line: number) {
    const pos = new vscode.Position(line, 0)
    if (!vscode.window.activeTextEditor) {
        return undefined
    }
    return await vscode.window.activeTextEditor.edit((edit) => {
        edit.insert(pos, snippet)
    })
}
