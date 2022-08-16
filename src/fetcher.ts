import * as vscode from 'vscode'
import type { Permalink } from './permalink'
import type { Extension } from './main'
import type { SnippetResource } from './types/types'

export class Fetcher {

    constructor(private readonly extension: Extension) {}

    async getSnippet(link: Permalink): Promise<string | undefined> {
        const resource = await this.extension.linkResolver.resolveSnippetResource(link)
        if (!resource) {
            return undefined
        }
        return this.getSnippetFromUri(resource)
    }

    async getSnippetFromUri(resource: SnippetResource): Promise<string> {
        try {
            const doc = (await vscode.workspace.fs.readFile(resource.uri)).toString()
            const arry = doc.split('\n').slice(resource.start - 1, resource.end)
            const snippet = arry.join('\n')
            return snippet
        } catch (e) {
            if (e instanceof Error) {
                console.log(resource.uri.toString())
                console.log(e.message)
                console.log(e.stack)
            }
            throw e
        }
    }

}
