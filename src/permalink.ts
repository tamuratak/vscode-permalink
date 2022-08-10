import type { WorkspaceFolder } from 'vscode'

export const PermalinkScheme = 'workspace'
// workspace://commit_hash/relative_path_to_file#LXX-YY
export const PermalinkRegExp = /workspace:\/\/([-_~a-zA-Z0-9/%@\\.]+)(?:#L(\d+)(-(\d+))?)?/

export class Permalink {
    readonly targetCode?: {
        readonly start: number,
        readonly end: number
    }

    constructor(
        public workspace: WorkspaceFolder | undefined,
        readonly path: string,
        start?: number,
        end?: number,
        readonly commit?: string
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
        return `${PermalinkScheme}://${this.commit}/${this.path}#${this.fragment}`
    }

}
