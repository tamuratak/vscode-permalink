import * as vscode from 'vscode'
import {getFileExt} from './ext'
import type {Extension} from './main'

export type PasteSnippetArgs = {
    uri: string,
    targetLine: number
}

export type ReplaceSnippetArgs = {
    uri: string,
    targetRange: vscode.Range
}

export class Command {

    constructor(private readonly extension: Extension) {}

    async copyLine(editor: vscode.TextEditor, withWorkspace = false) {
        const doc = editor.document
        const selection = editor.selection
        const startLine = selection.start.line + 1
        const endLine = selection.isEmpty ? startLine : selection.end.line + 1
        let wsName: string | undefined
        if (withWorkspace) {
            wsName = vscode.workspace.getWorkspaceFolder(doc.uri)?.name
        }
        const link = this.extension.linkFactory.fromDoc(doc, startLine, endLine, wsName)
        if (!link) {
            return
        }
        return await vscode.env.clipboard.writeText(link.toString())
    }

    async pasteLinkWithSnippet(editor: vscode.TextEditor) {
        const selection = editor.selection
        const linkStr = await vscode.env.clipboard.readText()
        const link = this.extension.linkFactory.fromStr(linkStr)
        if (!link) {
            return undefined
        }
        const snippet = await this.extension.fetcher.getSnippet(link)
        if (!snippet) {
            return undefined
        }
        const md = new vscode.MarkdownString(link.toString())
        const languageId = getFileExt(link)
        md.appendCodeblock(snippet, languageId)
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

    async pasteSnippet(snippet: string, line: number) {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            return undefined
        }
        if (editor.document.lineCount <= line) {
            snippet = '\n' + snippet
        }
        const pos = new vscode.Position(line, 0)
        return await editor.edit((edit) => {
            edit.insert(pos, snippet)
        })
    }

    async replaceSnippet(snippet: string, start: number, end: number) {
        if (!vscode.window.activeTextEditor) {
            return undefined
        }
        const range = new vscode.Range(start, 0, end + 1, 0)
        return await vscode.window.activeTextEditor.edit((edit) => {
            edit.replace(range, snippet)
        })
    }

}
