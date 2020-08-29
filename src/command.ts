import * as vscode from 'vscode'
import { getSnippet, LinkToCode } from './link'


export async function copyLine(editor: vscode.TextEditor) {
    const docUri = editor.document.uri
    const selection = editor.selection
    const startLine = selection.start.line + 1
    const endLine = selection.end.character === 0 ? selection.end.line : selection.end.line + 1
    const link = LinkToCode.fromUri(docUri, startLine, endLine)
    if (!link) {
        return
    }
    return await vscode.env.clipboard.writeText(link.toString())
}

export async function pasteLinkWithSnippet(editor: vscode.TextEditor) {
    const selection = editor.selection
    const linkStr = await vscode.env.clipboard.readText()
    const link = LinkToCode.fromStr(linkStr)
    if (!link) {
        return undefined
    }
    const snippet = await getSnippet(link)
    if (!snippet) {
        return undefined
    }
    const md = new vscode.MarkdownString(link.toString())
    md.appendCodeblock(snippet, 'typescript')
    if (selection.isEmpty) {
        return await editor.edit((edit) => {
            edit.insert(selection.start, md.value)
        })
    } else {
        return await editor.edit((edit) => {
            edit.replace(selection, md.value)
        })
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

export async function replaceSnippet(snippet: string, start: number, end: number) {
    if (!vscode.window.activeTextEditor) {
        return undefined
    }
    const range = new vscode.Range(start, 0, end, 3)
    return await vscode.window.activeTextEditor.edit((edit) => {
        edit.replace(range, snippet)
    })
}
