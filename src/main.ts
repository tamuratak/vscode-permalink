import * as vscode from 'vscode'
import {Command} from './command'
import {DocumentUtil} from './documentutil'
import {HoverOnLinkProvider} from './hoverprovider'
import {LinkToCodeLinkProvider} from './documentlinkprovider'
import {Fetcher} from './fetcher'
import {LinkToCodeFactory} from './linkfactory'
import {LinkResolver} from './linkresolver'
import {SnippetFactory} from './snippet'
import type {SnippetArgs, TargetRange} from './types/git/types'
import {GitExtension} from './types/git/git'
import path from 'path'
import {getRevisionUri} from './gitlens'
import {Git} from './git'


async function printCommitHash() {
    const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports
	const git = gitExtension?.getAPI(1)
    const uri = vscode.window.activeTextEditor?.document.uri
    const workspaceDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath
    if (workspaceDir && uri) {
        const revUri = getRevisionUri(workspaceDir, uri.path, '74a5ae3552')
        console.log(JSON.stringify(revUri))
        await vscode.commands.executeCommand('vscode.open', revUri)
        console.log(JSON.stringify(vscode.window.tabGroups.all.map((g) => g.tabs.map((tab) => {
            const input = tab.input as any
            const uri =  input.uri as vscode.Uri
            return uri.toString()
        }))))
        const fileString = await vscode.workspace.fs.readFile(revUri)
        console.log(fileString.slice(0,100).toString())
    }
    if (uri && git) {
        const dir = path.posix.dirname(uri.path)        
        const repo = await git.init(uri.with({path: dir}))
        console.log(JSON.stringify(repo?.rootUri.fsPath))
        let commit = await repo?.getCommit('HEAD')
        console.log(commit?.hash)
        commit = await repo?.getCommit('aef51adb2dba')
        console.log(commit?.hash)
    }
    const wspUri = vscode.Uri.parse('workspace://uu@aaa/sr!"#$%&\'@[{`]:;l}*+_?>_/.()0=~|c/main.ts?c=abd123', true)
    console.log(wspUri.toJSON())
    console.log(wspUri.toString())
}

export function activate(context: vscode.ExtensionContext) {
    const extension = new Extension()
    context.subscriptions.push(
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, new HoverOnLinkProvider(extension)),
        vscode.languages.registerDocumentLinkProvider({ scheme: 'file', language: 'markdown' }, new LinkToCodeLinkProvider(extension)),
        vscode.commands.registerTextEditorCommand('linktocode.copy-line', (editor) => {
            extension.command.copyLine(editor)
        }),
        vscode.commands.registerTextEditorCommand('linktocode.paste-link-with-snippet', (editor) => {
            extension.command.pasteLinkWithSnippet(editor)
        }),
        vscode.commands.registerCommand('linktocode.paste-snippet', (obj: SnippetArgs) => {
            extension.command.pasteSnippet(obj)
        }),
        vscode.commands.registerCommand('linktocode.remove-snippet', (obj: TargetRange) => {
            extension.command.removeSnippet(obj)
        }),
        vscode.commands.registerCommand('linktocode.printCommitHash', () => {
           printCommitHash() 
        })
    )
    console.log('link to code activated')
}

    export class Extension {
        readonly linkFactory: LinkToCodeFactory
        readonly linkResolver: LinkResolver
        readonly command: Command
        readonly documentUtil: DocumentUtil
        readonly fetcher: Fetcher
        readonly snippetFactory: SnippetFactory
        readonly git: Git

        constructor() {
            this.command = new Command(this)
            this.documentUtil = new DocumentUtil(this)
            this.fetcher = new Fetcher(this)
            this.linkFactory = new LinkToCodeFactory()
            this.linkResolver = new LinkResolver(this)
            this.snippetFactory = new SnippetFactory(this)
            this.git = new Git()
        }

    }
