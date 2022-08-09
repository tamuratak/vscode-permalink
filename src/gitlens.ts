import {Uri} from 'vscode'
import {decodeGitLensRevisionUriAuthority, getRevisionUri} from './gitlenslib/uriutils'
import type {LinkToCode} from './linktocode'

export class GitLens {

    getGitLensUri(link: LinkToCode) {
        if (link.workspace && link.commit) {
            return getRevisionUri(link.workspace.uri.fsPath, link.path, link.commit)
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
