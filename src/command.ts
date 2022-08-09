import * as vscode from 'vscode'
import {getFileExt} from './utils/fileext'
import type {Extension} from './main'
import type {SnippetResource, SnippetArgs, TargetRange} from './types/git/types'
import * as utils from './utils/utils'

export class Command {

    constructor(private readonly extension: Extension) {}

    async copyLine(editor: vscode.TextEditor) {
        const doc = editor.document
        const selection = editor.selection
        const startLine = selection.start.line + 1
        const endLine = selection.isEmpty ? startLine : selection.end.line + 1
        const commit = await this.extension.git.getCommit(doc.uri)
        const authority = commit?.hash.slice(0, 12)
        const link = this.extension.linkFactory.fromSelectionOnDoc(doc, startLine, endLine, authority)
        if (!link) {
            return
        }
        return await vscode.env.clipboard.writeText(link.toString())
    }

    async pasteLinkWithSnippet(editor: vscode.TextEditor) {
        const selection = editor.selection
        const linkStr = await vscode.env.clipboard.readText()
        const link = this.extension.linkFactory.fromLinkStr(linkStr)
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

    async pasteSnippet(args: SnippetArgs) {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
            return undefined
        }
        const snippeResource: SnippetResource = {
            uri:  vscode.Uri.parse(args.resource.uri),
            start: args.resource.start,
            end: args.resource.end
        }
        let snippet = (await this.extension.snippetFactory.createMarkdown(snippeResource)).value.trimLeft()
        if (editor.document.lineCount <= args.targetRange.start.line) {
            snippet = '\n' + snippet
        }
        const pos = new vscode.Position(args.targetRange.start.line, 0)
        return await editor.edit((edit) => {
            edit.insert(pos, snippet)
        })
    }

    async removeSnippet(targetRange: TargetRange) {
        if (!vscode.window.activeTextEditor) {
            return undefined
        }
        const range = utils.copyRange(targetRange)
        return await vscode.window.activeTextEditor.edit((edit) => {
            edit.replace(range, '')
        })
    }

}
