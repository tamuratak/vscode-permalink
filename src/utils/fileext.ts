import * as path from 'path'
import * as vscode from 'vscode'
import type { Permalink } from '../permalink'

export function getFileExt(link: Permalink | vscode.Uri) {
    const ext = path.posix.extname(link.path)
    if (ext.startsWith('.')) {
        return ext.substr(1)
    } else {
        return ext
    }
}
