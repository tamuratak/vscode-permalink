import * as vscode from 'vscode'
import {copyLine, pasteSnippet} from './command'
import {HoverOnLinkProvider} from './hoverprovider'

export function activate(context: vscode.ExtensionContext) {
	console.log('link to code activated')
	context.subscriptions.push(
		vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, new HoverOnLinkProvider()),
		vscode.commands.registerTextEditorCommand('linktocode.copy-line', (editor) => {
			copyLine(editor)
		}),
		vscode.commands.registerCommand('linktocode.paste-snippet', (obj) => {
			pasteSnippet(obj.snippet, obj.line)
		})
	)
}
