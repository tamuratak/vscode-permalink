import * as vscode from 'vscode'
import { Command } from './command'
import { HoverOnLinkProvider } from './hoverprovider'
import { LinkToCodeLinkProvider } from './documentlinkprovider'
import { Fetcher } from './fetcher'
import { LinkFactory } from './linkfactory'
import { LinkResolver } from './linkresolver'
import { SnippetFactory } from './snippet'
import { Git } from './git'
import { GitLens } from './gitlens'
import type { SnippetArgs, TargetRange } from './types/types'


async function printCommitHash() {
    const wspUri = vscode.Uri.parse('workspace://uu@aaa/sr!"#$%&\'@[{`]:;l}*+_?>_/.()0=~|c/main.ts?c=abd123', true)
    console.log(wspUri.toJSON())
    console.log(wspUri.toString())
}

export function activate(context: vscode.ExtensionContext) {
    const extension = new Extension()
    context.subscriptions.push(
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, new HoverOnLinkProvider(extension)),
        vscode.languages.registerDocumentLinkProvider({ scheme: 'file', language: 'markdown' }, new LinkToCodeLinkProvider(extension)),
        vscode.commands.registerTextEditorCommand('permalink.copy-line', (editor) => {
            extension.command.copyLine(editor)
        }),
        vscode.commands.registerTextEditorCommand('permalink.paste-link-with-snippet', (editor) => {
            extension.command.pasteLinkWithSnippet(editor)
        }),
        vscode.commands.registerCommand('permalink.paste-snippet', (obj: SnippetArgs) => {
            extension.command.pasteSnippet(obj)
        }),
        vscode.commands.registerCommand('permalink.remove-snippet', (obj: TargetRange) => {
            extension.command.removeSnippet(obj)
        }),
        vscode.commands.registerCommand('permalink.printCommitHash', () => {
           printCommitHash()
        })
    )
    console.log('link to code activated')
}

    export class Extension {
        readonly linkFactory: LinkFactory
        readonly linkResolver: LinkResolver
        readonly command: Command
        readonly fetcher: Fetcher
        readonly snippetFactory: SnippetFactory
        readonly git: Git
        readonly gitLens: GitLens

        constructor() {
            this.command = new Command(this)
            this.fetcher = new Fetcher(this)
            this.linkFactory = new LinkFactory(this)
            this.linkResolver = new LinkResolver(this)
            this.snippetFactory = new SnippetFactory(this)
            this.git = new Git()
            this.gitLens = new GitLens(this)
        }

    }
