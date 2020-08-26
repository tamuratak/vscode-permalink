import * as vscode from 'vscode'
import {TextDocument, Position} from 'vscode'

export class HoverOnLinkProvider implements vscode.HoverProvider {

	async provideHover(document: TextDocument, position: Position) {
		const reg = /([-_a-zA-Z0-9/\\:.]+)#L(\d+)(-(\d+))?/
		const range = document.getWordRangeAtPosition(position, reg)
		if (!range) {
			return undefined
		}
		const link = document.getText(range)
		const match = reg.exec(link)
		if (!match) {
			return undefined
		}
		const filePath = match[1]
		const start = Number(match[2]) - 1
		const end = match[4] ? Number(match[4]) - 1 : start
		if (!vscode.workspace.workspaceFolders) {
			return undefined
		}
		let linkUri: vscode.Uri | undefined
		for(const dir of vscode.workspace.workspaceFolders) {
			const uri = vscode.Uri.joinPath(dir.uri, filePath)
			try {
				await vscode.workspace.fs.stat(uri)
				linkUri = uri
				break
			} catch {}
		}
		if (!linkUri) {
			return undefined
		}
		const doc = (await vscode.workspace.fs.readFile(linkUri)).toString()
		const arry = doc.split('\n').slice(start, end + 1)
		const snippet = arry.join('\n')
		const md = new vscode.MarkdownString('```\n' + snippet + '\n```')
		return new vscode.Hover(md)
	}

}
