import * as vscode from 'vscode'
import {TextDocument, Position} from 'vscode'

export const scheme = 'linktocode'
export const reg = /linktocode:([-_~a-zA-Z0-9/\\.]+)#L(\d+)(-(\d+))?/

export class LinkToCode {
    constructor(
        readonly path: string,
        readonly start: number,
        readonly end: number,
        readonly range: vscode.Range
    ) {}

    async toUri(dir?: vscode.WorkspaceFolder): Promise<vscode.Uri | undefined> {
        if (dir) {
         return this.findFile(dir)
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
        const uri = vscode.Uri.joinPath(dir.uri, this.path)
        try {
            await vscode.workspace.fs.stat(uri)
            return uri
        } catch {
            return undefined
        }
    }
}

export function getLinkAtPosition(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position, reg)
    if (!range) {
        return undefined
    }
    const link = document.getText(range)
    const match = reg.exec(link)
    if (!match) {
        return undefined
    }
    const filePath = match[1]
    const start = Number(match[2]) - 1
    const end = match[4] ? Number(match[4]) - 1 : start
    return new LinkToCode(filePath, start, end, range)
}
