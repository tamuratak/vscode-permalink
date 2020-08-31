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

    toString() {
        if (this.workspace) {
            return `${scheme}://${this.workspace}/${this.path}#${this.fragment}`
        } else {
            return `${scheme}:///${this.path}#${this.fragment}`
        }

    }

}
