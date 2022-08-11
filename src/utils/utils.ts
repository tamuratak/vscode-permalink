import * as vscode from 'vscode'
import type { TargetRange } from '../types/types'

export function copyRange(range: TargetRange): vscode.Range {
    return new vscode.Range(range.start.line, range.start.character, range.end.line, range.end.character)
}

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
