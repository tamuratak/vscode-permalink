import * as vscode from 'vscode'
import { getFileExt } from './utils/fileext'
import type { Extension } from './main'
import type { SnippetResource } from './types/types'

export class SnippetFactory {

    constructor(private readonly extension: Extension) {}

    async createMarkdown(resource: SnippetResource) {
        const snippet = await this.extension.fetcher.getSnippetFromUri(resource)
        const snippetMd = new vscode.MarkdownString(undefined)
        const languageId = getFileExt(resource.uri)
        snippetMd.appendCodeblock(snippet, languageId)
        return snippetMd
    }

}
