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
            uri = vscode.Uri.parse(linkStr, true)
        } catch {
            return undefined
        }
        return this.fromUri(uri)
    }

    fromUri(uri: vscode.Uri): LinkToCode | undefined {
        if (uri.scheme !== link.scheme) {
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
        const wsName = this.workspaceName(uri)
        return new LinkToCode(filePath, start, end, wsName)
    }

    fromDoc(doc: vscode.TextDocument, start: number, end: number, wsName?: string): LinkToCode | undefined {
        const docUri = doc.uri
        const relPath = this.relativePath(docUri)
        if (!relPath) {
            return undefined
        }
        return new LinkToCode(relPath, start, end, wsName)
    }

}
