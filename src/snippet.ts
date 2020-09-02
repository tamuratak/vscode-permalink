import * as vscode from 'vscode'
import {getFileExt} from './fileext'
import type {Extension} from './main'
import type {FetcherTarget} from './types'

export class SnippetFactory {

    constructor(private readonly extension: Extension) {}

    async createMarkdown(target: FetcherTarget) {
        const snippet = await this.extension.fetcher.getSnippetFromUri(target)
        const snippetMd = new vscode.MarkdownString(undefined)
        const languageId = getFileExt(target.uri)
        snippetMd.appendCodeblock(snippet, languageId)
        return snippetMd
    }

}
