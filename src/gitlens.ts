import { Uri } from 'vscode'
import { decodeGitLensRevisionUriAuthority, getRevisionUri } from './gitlenslib/uriutils'
import type { Permalink } from './permalink'
import type { Extension } from './main'

export class GitLens {

    constructor(private readonly extension: Extension) { }

    async getGitLensUri(link: Permalink) {
        if (link.commit) {
            const workspace = await this.extension.git.findWorkspaceFolder(link.commit)
            if (workspace) {
                return getRevisionUri(workspace.uri.fsPath, link.path, link.commit)
            }
        }
        return
    }

    getRevisionUriData(uri: Uri) {
        if (uri.scheme === 'gitlens') {
            return decodeGitLensRevisionUriAuthority(uri.authority)
        }
        return
    }

}
