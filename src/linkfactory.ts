import * as pathMod from 'path'
import * as vscode from 'vscode'
import * as link from './permalink'
import { Permalink } from './permalink'
import type { Extension } from './main'

export class LinkToCodeFactory {

    constructor(private readonly extension: Extension) { }

    private relativePath(uri: vscode.Uri) {
        const dir = vscode.workspace.getWorkspaceFolder(uri)
        if (!dir) {
            return undefined
        }
        return pathMod.posix.relative(dir.uri.path, uri.path)
    }

    fromPermalinkStr(linkStr: string, doc?: vscode.TextDocument): Permalink | undefined {
        let uri: vscode.Uri
        try {
            uri = vscode.Uri.parse(linkStr, true)
        } catch {
            return undefined
        }
        return this.fromPermalinkUri(uri, doc)
    }

    private guessWorkspace(uri: vscode.Uri, doc?: vscode.TextDocument) {
        const workspace = vscode.workspace.getWorkspaceFolder(uri) || doc && vscode.workspace.getWorkspaceFolder(doc.uri)
        return workspace
    }

    private fromPermalinkUri(uri: vscode.Uri, doc?: vscode.TextDocument): Permalink | undefined {
        if (uri.scheme !== link.PermalinkScheme) {
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
        return new Permalink(workspace, filePath, start, end, authority)
    }

    fromSelectionOnDoc(doc: vscode.TextDocument, start: number, end: number, commit?: string): Permalink | undefined {
        if (doc.uri.scheme === 'gitlens') {
            return this.fromSelectionOnGitLensVirtualFile(doc, start, end)
        }
        const docUri = doc.uri
        const relPath = this.relativePath(docUri)
        if (!relPath) {
            return undefined
        }
        const workspace = vscode.workspace.getWorkspaceFolder(doc.uri)
        return new Permalink(workspace, relPath, start, end, commit)
    }

    fromSelectionOnGitLensVirtualFile(doc: vscode.TextDocument, start: number, end: number): Permalink | undefined {
        const repoData = this.extension.gitLens.getRevisionUriData(doc.uri)
        if (repoData) {
            const workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(repoData.repoPath))
            if (workspace) {
                const relativepath = pathMod.posix.relative(workspace.uri.path, doc.uri.path)
                return new Permalink(workspace, relativepath, start, end, repoData.ref)
            }
        }
        return
    }

}
