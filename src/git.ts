import * as vscode from 'vscode'
import type {Uri, WorkspaceFolder} from 'vscode'
import type {API, Commit, GitExtension, Repository} from 'git'
import { sleep } from './utils/utils'

export class Git {
    #gitApi: API | undefined
    private workspaceRepositoryMap = new Map<string, Repository>()
    private commitWorkspaceMap = new Map<string, WorkspaceFolder>()
    private alreadySleep = false

    private async gitApi() {
        if (this.#gitApi) {
            return this.#gitApi
        }
        if (!this.alreadySleep) {
            await sleep(2000)
            this.alreadySleep = true
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
        const api = await this.gitApi()
        repo = await api?.init(workspace.uri) || undefined
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

    async getLatestCommit(uri: Uri ): Promise<Commit | undefined> {
        const workspace = vscode.workspace.getWorkspaceFolder(uri)
        if (workspace) {
            const repo = await this.getRepository(workspace)
            const commits = await repo?.log({path: uri.fsPath, maxEntries: 1})
            return commits?.[0]
        }
        return
    }

}
