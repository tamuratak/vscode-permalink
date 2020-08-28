import * as vscode from 'vscode'
import {copyLine, pasteSnippet, replaceSnippet} from './command'
import {HoverOnLinkProvider} from './hoverprovider'
import {LinkToCodeLinkProvider} from './documentlinkprovider'

export function activate(context: vscode.ExtensionContext) {
	console.log('link to code activated')
	context.subscriptions.push(
		vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, new HoverOnLinkProvider()),
		vscode.languages.registerDocumentLinkProvider({ scheme: 'file', language: 'markdown' }, new LinkToCodeLinkProvider()),
		vscode.commands.registerTextEditorCommand('linktocode.copy-line', (editor) => {
			copyLine(editor)
		}),
		vscode.commands.registerCommand('linktocode.paste-snippet', (obj) => {
			pasteSnippet(obj.snippet, obj.line)
		}),
		vscode.commands.registerCommand('linktocode.replace-snippet', (obj) => {
			replaceSnippet(obj.snippet, obj.start, obj.end)
		})
	)
}
