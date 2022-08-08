import type {WorkspaceFolder} from "vscode"

export const LinkToCodeScheme = 'workspace'
// workspace://workspace_name/relative_path_to_file#LXX-YY
export const LinkToCodeRegExp = /workspace:([-_~a-zA-Z0-9/%@\\.]+)(?:#L(\d+)(-(\d+))?)?/

export class LinkToCode {
    readonly targetCode?: {
        readonly start: number,
        readonly end: number
    }

    constructor(
        readonly workspace: WorkspaceFolder | undefined,
        readonly path: string,
        start?: number,
        end?: number,
        readonly authority?: string
    ) {
        if (start !== undefined) {
            if (end !== undefined) {
                this.targetCode = { start, end }
            } else {
                this.targetCode = { start, end: start }
            }
        }
    }

    get fragment(): string {
        if (!this.targetCode) {
            return ''
        }
        const {start, end} = this.targetCode
        if (start === end) {
            return `L${start}`
        } else {
            return `L${start}-${end}`
        }
    }

    toString() {
        return `${LinkToCodeScheme}://${this.authority}/${this.path}#${this.fragment}`
    }

}
