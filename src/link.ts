import * as vscode from 'vscode'
export const scheme = 'workspace'
// workspace://workspace_name/relative_path_to_file#LXX-YY
export const reg = /workspace:([-_~a-zA-Z0-9/\\.]+)(?:#L(\d+)(-(\d+))?)?/

export class LinkToCode {

    constructor(
        readonly path: string,
        readonly start?: number,
        readonly end?: number,
        readonly workspace?: string
    ) {}

    get fragment(): string {
        if (this.start === undefined) {
            return ''
        }
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
        if (this.workspace) {
            return `${scheme}://${this.workspace}/${this.path}#${this.fragment}`
        } else {
            return `${scheme}:///${this.path}#${this.fragment}`
        }

    }

}
