import * as vscode from 'vscode'
import { getRevisionUri } from './gitlenslib/gitlens'
import type {LinkToCode} from './linktocode'
import { Extension } from './main'
import type {SnippetResource} from './types/git/types'

export class LinkResolver {

    constructor(readonly extension: Extension) { }

    async resolveSnippetResource(link: LinkToCode): Promise<SnippetResource | undefined> {
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

    private getGitLensUri(link: LinkToCode) {
        if (link.workspace && link.commit) {
            return getRevisionUri(link.workspace.uri.fsPath, link.path, link.commit)
        }
        return
    }

    async resolveLink(link: LinkToCode): Promise<vscode.Uri | undefined> {
        if (link.commit) {
            if (!link.workspace) {
                return
            }
            return this.getGitLensUri(link)
        }
        if (link.workspace) {
            return this.findFile(link, link.workspace)
        }
        for(const folder of vscode.workspace.workspaceFolders || []) {
            return this.findFile(link, folder)
        }
        return undefined
    }

    private async findFile(link: LinkToCode, dir: vscode.WorkspaceFolder) {
        const uri = vscode.Uri.joinPath(dir.uri, '.', link.path)
        try {
            await vscode.workspace.fs.stat(uri)
            return uri
        } catch {
            return undefined
        }
    }

}
