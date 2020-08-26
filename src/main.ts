import * as vscode from 'vscode'
import {HoverOnLinkProvider} from './hoverprovider'

export function activate(context: vscode.ExtensionContext) {
	console.log('link to code activated')
	context.subscriptions.push(
		vscode.languages.registerHoverProvider({ scheme: 'file', language: 'markdown' }, new HoverOnLinkProvider())
	)
}
