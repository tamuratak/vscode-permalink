import * as vscode from 'vscode'
import type {Uri, WorkspaceFolder} from 'vscode'
import type {API, Commit, GitExtension, Repository} from './types/git/git'

export class Git {
    #gitApi: API | undefined
    private workspaceRepositoryMap = new Map<string, Repository>()
    private commitWorkspaceMap = new Map<string, WorkspaceFolder>()

    private get gitApi() {
        if (this.#gitApi) {
            return this.#gitApi
        }
        const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
        this.#gitApi = gitExtension?.getAPI(1)
        return this.#gitApi
    }

    async getRepository(workspace: WorkspaceFolder): Promise<Repository | undefined> {
        const uri = workspace.uri.toString()
        let repo = this.workspaceRepositoryMap.get(uri)
        if (repo) {
            return repo
        }
        repo = await this.gitApi?.init(workspace.uri) || undefined
        if (repo) {
            this.workspaceRepositoryMap.set(uri, repo)
        }
        return repo
    }

    async findWorkspaceFolder(commit: string): Promise<WorkspaceFolder | undefined> {
        const ret = this.commitWorkspaceMap.get(commit)
        if (ret) {
            return ret
        }
        const dirs = vscode.workspace.workspaceFolders || []
        for (const dir of dirs) {
            const repo = await this.getRepository(dir)
            const commitObj = repo?.getCommit(commit)
            if (commitObj) {
                this.commitWorkspaceMap.set(commit, dir)
                return dir
            }
        }
        return
    }

    async getHeadCommit(uri: Uri): Promise<Commit | undefined> {
        const workspace = vscode.workspace.getWorkspaceFolder(uri)
        if (workspace) {
            const repo = await this.getRepository(workspace)
            const commit = await repo?.getCommit('HEAD')
            return commit
        }
        return
    }

}
