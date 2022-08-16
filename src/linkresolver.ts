import * as vscode from 'vscode'
import type { Permalink } from './permalink'
import type { Extension } from './main'
import type { SnippetResource } from './types/types'

export class LinkResolver {

    constructor(private readonly extension: Extension) { }

    async resolveSnippetResource(link: Permalink): Promise<SnippetResource | undefined> {
        if (!link.targetCode) {
            return undefined
        }
        const linkUri = await this.resolveLink(link)
        if (!linkUri) {
            return undefined
        }
        return {
            uri: linkUri,
            start: link.targetCode.start,
            end: link.targetCode.end
        }
    }

    async resolveLink(link: Permalink): Promise<vscode.Uri | undefined> {
        if (link.commit) {
            // return this.extension.gitLens.getGitLensUri(link)
            return this.extension.git.getGitExtensionUri(link)
        }
        if (link.workspace) {
            return this.findFile(link, link.workspace)
        }
        return
    }

    private async findFile(link: Permalink, dir: vscode.WorkspaceFolder) {
        const uri = vscode.Uri.joinPath(dir.uri, '.', link.path)
        try {
            await vscode.workspace.fs.stat(uri)
            return uri
        } catch {
            return undefined
        }
    }

}
