import {getRevisionUri} from './gitlenslib/gitlens'
import type {LinkToCode} from './linktocode'

export class GitLens {

    getGitLensUri(link: LinkToCode) {
        if (link.workspace && link.commit) {
            return getRevisionUri(link.workspace.uri.fsPath, link.path, link.commit)
        }
        return
    }

}