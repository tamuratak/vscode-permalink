import * as vscode from 'vscode'
import type {SnippetArgs} from './types'

export function copyRange(range: SnippetArgs['targetRange']): vscode.Range {
    return new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character)
}
