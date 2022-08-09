import * as vscode from 'vscode'
import {Uri, WorkspaceFolder} from "vscode"
import {API, GitExtension} from './types/git/git'

export class Git {
    #gitApi: API | undefined

    private get gitApi() {
        if (this.#gitApi) {
            return this.#gitApi
        }
        const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
        this.#gitApi = gitExtension?.getAPI(1)
        return this.#gitApi
    }

    async getRepository(workspace: WorkspaceFolder) {
        return await this.gitApi?.init(workspace.uri)
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
