import * as vscode from 'vscode'
import {Uri} from "vscode"
import path from 'path'
import {GitExtension} from './types/git/git'

export class Git {
    constructor() { }

    get gitApi() {
        const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
        return gitExtension?.getAPI(1)
    }

    async getCommit(uri: Uri) {
        const dir = path.posix.dirname(uri.path)        
        const repo = await this.gitApi?.init(uri.with({path: dir}))
        const commit = await repo?.getCommit('HEAD')
        return commit
    }

}
