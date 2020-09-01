import * as vscode from 'vscode'
import {getFileExt} from './fileext'
import {LinkToCode} from './link'
import type {Extension} from './main'

export class SnippetFactory {

    constructor(private readonly extension: Extension) {}

    async createMarkdown(link: LinkToCode) {
        const snippet = await this.extension.fetcher.getSnippet(link)
        if (snippet === undefined) {
            return undefined
        }
        const snippetMd = new vscode.MarkdownString(undefined)
        const languageId = getFileExt(link)
        snippetMd.appendCodeblock(snippet, languageId)
        return snippetMd
    }

}
