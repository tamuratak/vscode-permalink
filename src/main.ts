import * as vscode from 'vscode'
import {Command} from './command'
import {DocumentUtil} from './documentutil'
import {HoverOnLinkProvider} from './hoverprovider'
import {LinkToCodeLinkProvider} from './documentlinkprovider'
import {LinkToCodeFactory} from './linkfactory'

export function activate(context: vscode.ExtensionContext) {
	const extension = new Extension()
	console.log('link to code activated')
	context.subscriptions.push(
		vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, new HoverOnLinkProvider(extension)),
		vscode.languages.registerDocumentLinkProvider({ scheme: 'file', language: 'markdown' }, new LinkToCodeLinkProvider(extension)),
		vscode.commands.registerTextEditorCommand('linktocode.copy-line', (editor) => {
			extension.command.copyLine(editor)
		}),
		vscode.commands.registerTextEditorCommand('linktocode.paste-link-with-snippet', (editor) => {
			extension.command.pasteLinkWithSnippet(editor)
		}),
		vscode.commands.registerCommand('linktocode.paste-snippet', (obj) => {
			extension.command.pasteSnippet(obj.snippet, obj.line)
		}),
		vscode.commands.registerCommand('linktocode.replace-snippet', (obj) => {
			extension.command.replaceSnippet(obj.snippet, obj.start, obj.end)
		})
	)
}

export class Extension {
	readonly linkFactory: LinkToCodeFactory
	readonly command: Command
	readonly documentUtil: DocumentUtil

	constructor() {
		this.command = new Command(this)
		this.documentUtil = new DocumentUtil(this)
		this.linkFactory = new LinkToCodeFactory()
	}
}
