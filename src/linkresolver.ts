import * as vscode from 'vscode'
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

    async resolveLink(link: LinkToCode): Promise<vscode.Uri | undefined> {
        let workspace: vscode.WorkspaceFolder | undefined
        if (link.authority) {
            workspace = vscode.workspace.workspaceFolders?.find((ws) => ws.name === link.authority)
            if (!workspace) {
                const commit = link.authority
                const repo = await this.extension.git.defaultRepo()
                repo?.getCommit(commit)
            }
        }
        const curDocUri = vscode.window.activeTextEditor?.document.uri
        if (curDocUri) {
            const curFoler = vscode.workspace.getWorkspaceFolder(curDocUri)
            if (curFoler) {
                return this.findFile(link, curFoler)
            }
        }
        if (!vscode.workspace.workspaceFolders) {
            return undefined
        }
        for(const folder of vscode.workspace.workspaceFolders) {
            const ret = await this.findFile(link, folder)
            if (ret) {
                return ret
            }
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
