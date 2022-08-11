import * as vscode from 'vscode'
import { Permalink, PermalinkScheme } from './permalink'
import type { Extension } from './main'

export class LinkFactory {

    constructor(private readonly extension: Extension) { }

    private removeFirstSlash(path: string): string {
        if (path.startsWith('/')) {
            return path.slice(1)
        } else {
            return path
        }
    }

    private relativePath(argWorkspace: vscode.WorkspaceFolder | undefined, uri: vscode.Uri): string | undefined {
        const dir = argWorkspace || vscode.workspace.getWorkspaceFolder(uri)
        if (!dir) {
            return undefined
        }
        if (!uri.path.startsWith(dir.uri.path)) {
            return undefined
        }
        const relativePath = uri.path.slice(dir.uri.path.length)
        return this.removeFirstSlash(relativePath)
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
        if (uri.scheme !== PermalinkScheme) {
            return undefined
        }
        const filePath = this.removeFirstSlash(uri.path)
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
        const relPath = this.relativePath(undefined, docUri)
        if (!relPath) {
            return undefined
        }
        const workspace = vscode.workspace.getWorkspaceFolder(doc.uri)
        return new Permalink(workspace, relPath, start, end, commit)
    }

    private fromSelectionOnGitLensVirtualFile(doc: vscode.TextDocument, start: number, end: number): Permalink | undefined {
        const repoData = this.extension.gitLens.getRevisionUriData(doc.uri)
        if (repoData) {
            const workspace = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(repoData.repoPath))
            if (workspace) {
                const relativepath = this.relativePath(workspace, doc.uri)
                if (relativepath) {
                    return new Permalink(workspace, relativepath, start, end, repoData.ref)
                }
            }
        }
        return
    }

}
