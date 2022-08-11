import * as vscode from 'vscode'
import type { Permalink } from '../permalink'

export function getFileExt(link: Permalink | vscode.Uri): string | undefined {
    const match = /\.([^.\/]+)$/.exec(link.path)
    if (match) {
        return match[1]
    }
    return
}
