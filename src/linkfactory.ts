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

    private workspaceName(uri: vscode.Uri) {
        const name = uri.authority
        if (name && name !== '') {
            return name
        } else {
            return undefined
        }
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
        const wsName = this.workspaceName(uri)
        return new LinkToCode(filePath, start, end, wsName)
    }

    fromUri(uri: vscode.Uri, start: number, end: number): LinkToCode | undefined {
        const relPath = this.relativePath(uri)
        if (!relPath) {
            return undefined
        }
        const wsName = this.workspaceName(uri)
        return new LinkToCode(relPath, start, end, wsName)
    }

}
