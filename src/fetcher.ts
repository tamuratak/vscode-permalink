import * as vscode from 'vscode'
import {LinkToCode} from './link'
import type {Extension} from './main'
import type {SnippetResource} from './types'

export class Fetcher {

    constructor(private readonly extension: Extension) {}

    async getSnippet(link: LinkToCode): Promise<string | undefined> {
        const resource = await this.extension.linkResolver.resolveSnippetResource(link)
        if (!resource) {
            return undefined
        }
        return this.getSnippetFromUri(resource)
    }

    async getSnippetFromUri(resource: SnippetResource): Promise<string> {
        const doc = (await vscode.workspace.fs.readFile(resource.uri)).toString()
        const arry = doc.split('\n').slice(resource.start - 1, resource.end)
        const snippet = arry.join('\n')
        return snippet
    }

}
