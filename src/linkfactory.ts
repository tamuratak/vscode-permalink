import * as pathMod from 'path'
import * as vscode from 'vscode'
import * as link from './linktocode'
import {LinkToCode} from './linktocode'
import {Extension} from './main'

export class LinkToCodeFactory {

    constructor(private readonly extension: Extension) { }

    private relativePath(uri: vscode.Uri) {
        const dir = vscode.workspace.getWorkspaceFolder(uri)
        if (!dir) {
            return undefined
        }
        return pathMod.posix.relative(dir.uri.path, uri.path)
    }

    fromLinkStr(linkStr: string, doc?: vscode.TextDocument): LinkToCode | undefined {
        let uri: vscode.Uri
        try {
            uri = vscode.Uri.parse(linkStr, true)
        } catch {
            return undefined
        }
        return this.fromUri(uri, doc)
    }

    private guessWorkspace(uri: vscode.Uri, doc?: vscode.TextDocument) {
        const workspace = vscode.workspace.getWorkspaceFolder(uri) || doc && vscode.workspace.getWorkspaceFolder(doc.uri)
        return workspace
    }

    private fromUri(uri: vscode.Uri, doc?: vscode.TextDocument): LinkToCode | undefined {
        if (uri.scheme !== link.LinkToCodeScheme) {
            return undefined
        }
        const filePath = uri.path.replace(/^\//, '')
        let start: number | undefined
        let end: number | undefined
        const match = /L(\d+)([-,](\d+))?/.exec(uri.fragment)
        if (match) {
            start = Number(match[1])
            end = match[3] ? Number(match[3]) : start
        }
        const authority = uri.authority || undefined
        const workspace = this.guessWorkspace(uri, doc)
        return new LinkToCode(workspace, filePath, start, end, authority)
    }

    fromSelectionOnDoc(doc: vscode.TextDocument, start: number, end: number, commit?: string): LinkToCode | undefined {
        if (doc.uri.scheme === 'gitlens') {
            return this.fromSelectionOnGitLensVirtualFile(doc, start, end)
        }
        const docUri = doc.uri
        const relPath = this.relativePath(docUri)
        if (!relPath) {
            return undefined
        }
        const workspace = vscode.workspace.getWorkspaceFolder(doc.uri)
        return new LinkToCode(workspace, relPath, start, end, commit)
    }

    fromSelectionOnGitLensVirtualFile(doc: vscode.TextDocument, start: number, end: number): LinkToCode | undefined {
        const repoData = this.extension.gitLens.getRevisionUriData(doc.uri)
        if (repoData) {
            const workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(repoData.repoPath))
            if (workspace) {
                const relativepath = pathMod.posix.relative(workspace.uri.path, doc.uri.path)
                return new LinkToCode(workspace, relativepath, start, end, repoData.ref)
            }
        }
        return
    }

}
