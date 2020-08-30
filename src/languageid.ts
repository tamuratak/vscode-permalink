import * as path from 'path'
import * as vscode from 'vscode'
import {languageIds} from './languageiddata'
import type {LinkToCode} from './link'

export function getLanguageId(ext: string) {
    for (const obj of languageIds) {
        if (obj.extensions?.includes(ext)) {
            return obj.id
        }
    }
    return undefined
}

export function getLanguageIdFromUri(uri: vscode.Uri) {
    const ext = path.posix.extname(uri.path)
    return getLanguageId(ext)
}

export function getLanguageIdFromLink(link: LinkToCode) {
    const ext = path.posix.extname(link.path)
    return getLanguageId(ext)
}
