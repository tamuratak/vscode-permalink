import * as pathMod from 'path'
import * as vscode from 'vscode'
import * as link from './link'
import {LinkToCode} from './link'

export class LinkToCodeFactory {
    private relativePath(uri: vscode.Uri) {
        const dir = vscode.workspace.getWorkspaceFolder(uri)
        if (!dir) {
            return undefined
        }
        return pathMod.posix.relative(dir.uri.path, uri.path)
    }

    private workspace(uri: vscode.Uri) {
        const ws = vscode.workspace.workspaceFolders?.find((dir) => dir.name === uri.authority)
        if (ws) {
            return ws
        }
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 1) {
            const dir = vscode.workspace.getWorkspaceFolder(uri)
            return dir
        }
        return undefined
    }

    fromStr(linkStr: string): LinkToCode | undefined {
        let uri: vscode.Uri
        try {
            uri = vscode.Uri.parse(linkStr)
        } catch {
            return undefined
        }
        if (uri.scheme !== link.scheme) {
            return undefined
        }
        const filePath = uri.path
        const match = /L(\d+)([-,](\d+))?/.exec(uri.fragment)
        if (!match) {
            return undefined
        }
        const start = Number(match[1])
        const end = match[3] ? Number(match[3]) : start
        const ws = this.workspace(uri)
        return new LinkToCode(filePath, start, end, ws)
    }

    fromUri(uri: vscode.Uri, start: number, end: number): LinkToCode | undefined {
        const relPath = this.relativePath(uri)
        if (!relPath) {
            return undefined
        }
        const ws = this.workspace(uri)
        return new LinkToCode(relPath, start, end, ws)
    }

}
