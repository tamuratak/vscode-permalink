import * as pathMod from 'path'
import * as vscode from 'vscode'
import {TextDocument, Position} from 'vscode'

export const scheme = 'workspace'
export const reg = /workspace:([-_~a-zA-Z0-9/\\.]+)#L(\d+)(-(\d+))?/

export class LinkToCode {

    private static relativePath(uri: vscode.Uri) {
        const dir = vscode.workspace.getWorkspaceFolder(uri)
        if (!dir) {
            return undefined
        }
        return '/' + pathMod.posix.relative(dir.uri.path, uri.path)
    }

    static fromStr(linkStr: string): LinkToCode | undefined {
        const match = reg.exec(linkStr)
        if (!match) {
            return undefined
        }
        const filePath = match[1]
        const start = Number(match[2])
        const end = match[4] ? Number(match[4]) : start
        return new LinkToCode(filePath, start, end)
    }

    static fromUri(uri: vscode.Uri, start: number, end: number): LinkToCode | undefined {
        const relPath = LinkToCode.relativePath(uri)
        if (!relPath) {
            return undefined
        }
        return new LinkToCode(relPath, start, end)
    }

    constructor(
        readonly path: string,
        readonly start: number,
        readonly end: number
    ) {}

    get fragment(): string {
        if (this.start === this.end) {
            return `L${this.start}`
        } else {
            return `L${this.start}-${this.end}`
        }
    }

    async toUri(dir?: vscode.WorkspaceFolder): Promise<vscode.Uri | undefined> {
        if (dir) {
         return this.findFile(dir)
        }
        const curDocUri = vscode.window.activeTextEditor?.document.uri
        if (curDocUri) {
            const curFoler = vscode.workspace.getWorkspaceFolder(curDocUri)
            if (curFoler) {
                return this.findFile(curFoler)
            }
        }
        if (!vscode.workspace.workspaceFolders) {
            return undefined
        }
        for(const folder of vscode.workspace.workspaceFolders) {
            const ret = await this.findFile(folder)
            if (ret) {
                return ret
            }
        }
        return undefined
    }

    private async findFile(dir: vscode.WorkspaceFolder) {
        const uri = vscode.Uri.joinPath(dir.uri, '.', this.path)
        try {
            await vscode.workspace.fs.stat(uri)
            return uri
        } catch {
            return undefined
        }
    }

    toString() {
        return `${scheme}://${this.path}#${this.fragment}`
    }

}

export async function getSnippet(link: LinkToCode) {
    const start = link.start
    const end = link.end
    const linkUri = await link.toUri()
    if (!linkUri) {
        return undefined
    }
    const doc = (await vscode.workspace.fs.readFile(linkUri)).toString()
    const arry = doc.split('\n').slice(start - 1, end)
    const snippet = arry.join('\n')
    return snippet
}

export type LinkBlock = {
    link: LinkToCode,
    linkStrRange: vscode.Range,
    codeBlockRange?: vscode.Range
}

export function getLinkAtPosition(document: TextDocument, position: Position): LinkBlock | undefined {
    const linkStrRange = document.getWordRangeAtPosition(position, reg)
    if (!linkStrRange) {
        return undefined
    }
    const linkStr = document.getText(linkStrRange)
    const link = LinkToCode.fromStr(linkStr)
    if (!link) {
        return undefined
    }
    const codeBlockRange = getCodeBlock(document, position.line + 1)
    return { link, linkStrRange, codeBlockRange }
}

function getCodeBlock(document: TextDocument, line: number) {
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
