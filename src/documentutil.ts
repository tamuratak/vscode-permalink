import * as vscode from 'vscode'
import * as linkMod from './linktocode'
import {LinkToCode} from './linktocode'
import type {Extension} from './main'

export type LinkBlock = {
    link: LinkToCode,
    linkStrRange: vscode.Range,
    codeBlockRange?: vscode.Range
}

export class DocumentUtil {

    constructor(private readonly extension: Extension) {}

    getLinkAtPosition(document: vscode.TextDocument, position: vscode.Position): LinkBlock | undefined {
        const linkStrRange = document.getWordRangeAtPosition(position, linkMod.LinkToCodeRegExp)
        if (!linkStrRange) {
            return undefined
        }
        const linkStr = document.getText(linkStrRange)
        const link = this.extension.linkFactory.fromStr(linkStr, document)
        if (!link) {
            return undefined
        }
        const codeBlockRange = this.getCodeBlock(document, position.line + 1)
        return { link, linkStrRange, codeBlockRange }
    }

    getCodeBlock(document: vscode.TextDocument, line: number) {
        if (line >= document.lineCount) {
            return undefined
        }
        const lineText = document.lineAt(line)
        if (!lineText.text.startsWith('```')) {
            return undefined
        }
        let i: number
        let endPos: vscode.Position | undefined
        for (i = 1; i < 100; i++) {
            const curLine = line + i
            if (curLine >= document.lineCount) {
                break
            }
            const s = document.lineAt(curLine).text
            if (s.startsWith('```')){
                endPos = new vscode.Position(curLine, 3)
                break
            }
        }
        if(!endPos) {
            return
        }
        const startPos = new vscode.Position(line, 0)
        const range = new vscode.Range(startPos, endPos)
        return range
    }

}
