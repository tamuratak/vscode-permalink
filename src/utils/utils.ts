import * as vscode from 'vscode'
import type { TargetRange } from '../types/git/types'

export function copyRange(range: TargetRange): vscode.Range {
    return new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character)
}
