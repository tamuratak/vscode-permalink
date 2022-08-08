import * as vscode from 'vscode'
import {Uri} from "vscode"
import {API, GitExtension, Repository} from './types/git/git'

export class Git {
    #gitApi: API | undefined
    #defaultRepo: Repository | undefined

    constructor() { }

    private get gitApi() {
        if (this.#gitApi) {
            return this.#gitApi
        }
        const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
        this.#gitApi = gitExtension?.getAPI(1)
        return this.#gitApi
    }

    async defaultRepo() {
        if (this.#defaultRepo) {
            return this.#defaultRepo
        }
        const workspace = vscode.workspace.workspaceFolders?.[0]
        if (workspace) {
            this.#defaultRepo = (await this.gitApi?.init(workspace.uri)) || undefined
        }
        return this.#defaultRepo
    }

    async getCommit(uri: Uri) {
        const workspace = vscode.workspace.getWorkspaceFolder(uri)
        if (workspace) {
            const repo = await this.gitApi?.init(workspace.uri)
            const commit = await repo?.getCommit('HEAD')
            return commit
        }
        return
    }

}
