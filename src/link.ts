export const scheme = 'workspace'
// workspace://workspace_name/relative_path_to_file#LXX-YY
export const reg = /workspace:([-_~a-zA-Z0-9/\\.]+)(?:#L(\d+)(-(\d+))?)?/

export class LinkToCode {
    readonly target?: {
        readonly start: number,
        readonly end: number
    }

    constructor(
        readonly path: string,
        start?: number,
        end?: number,
        readonly workspace?: string
    ) {
        if (start !== undefined) {
            if (end !== undefined) {
                this.target = { start, end }
            } else {
                this.target = { start, end: start }
            }
        }
    }

    get fragment(): string {
        if (!this.target) {
            return ''
        }
        const {start, end} = this.target
        if (start === end) {
            return `L${start}`
        } else {
            return `L${start}-${end}`
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
