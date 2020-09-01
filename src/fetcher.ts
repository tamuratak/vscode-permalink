import * as vscode from 'vscode'
import {LinkToCode} from './link'
import type {Extension} from './main'
import type {FetcherTarget} from './types'

export class Fetcher {

    constructor(private readonly extension: Extension) {}

    async getSnippet(link: LinkToCode): Promise<string | undefined> {
        const target = await this.extension.linkResolver.resolveFetcherTarget(link)
        if (!target) {
            return undefined
        }
        return this.getSnippetFromUri(target)
    }

    async getSnippetFromUri(target: FetcherTarget): Promise<string> {
        const doc = (await vscode.workspace.fs.readFile(target.uri)).toString()
        const arry = doc.split('\n').slice(target.start - 1, target.end)
        const snippet = arry.join('\n')
        return snippet
    }

}
