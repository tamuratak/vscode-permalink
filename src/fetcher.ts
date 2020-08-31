import * as vscode from 'vscode'
import {LinkToCode} from './link'
import type {Extension} from './main'

export class Fetcher {

    constructor(private readonly extension: Extension) {}

    async getSnippet(link: LinkToCode) {
        const start = link.start
        const end = link.end
        if (start === undefined || end === undefined) {
            return undefined
        }
        const linkUri = await this.extension.linkResolver.resolveLink(link)
        if (!linkUri) {
            return undefined
        }
        const doc = (await vscode.workspace.fs.readFile(linkUri)).toString()
        const arry = doc.split('\n').slice(start - 1, end)
        const snippet = arry.join('\n')
        return snippet
    }
}
