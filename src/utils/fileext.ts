import * as path from 'path'
import * as vscode from 'vscode'
import type {LinkToCode} from '../linktocode'

export function getFileExt(link: LinkToCode | vscode.Uri) {
    const ext = path.posix.extname(link.path)
    if (ext.startsWith('.')) {
        return ext.substr(1)
    } else {
        return ext
    }
}
