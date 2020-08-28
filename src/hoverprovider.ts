import * as vscode from 'vscode'
import {TextDocument, Position} from 'vscode'
import {getLinkAtPosition} from './link'

export class HoverOnLinkProvider implements vscode.HoverProvider {

	async provideHover(document: TextDocument, position: Position) {
		const linkBlk = getLinkAtPosition(document, position)
		if (!linkBlk) {
			return undefined
		}
		const link = linkBlk.link
		const start = link.start
		const end = link.end
		const linkUri = await link.toUri()
		if (!linkUri) {
			return undefined
		}
		const doc = (await vscode.workspace.fs.readFile(linkUri)).toString()
		const arry = doc.split('\n').slice(start - 1, end)
		const snippet = arry.join('\n')
		const md = new vscode.MarkdownString(undefined, true)
		md.appendCodeblock(snippet, 'typescript')
		const cmdlink = vscode.Uri.parse('command:linktocode.paste-snippet').with({
			query: JSON.stringify({
				snippet: md.value.trimLeft(),
				line: position.line + 1
			})
		})
		md.appendMarkdown(`[Fetch](${cmdlink})`)
		md.isTrusted = true
		return new vscode.Hover(md, linkBlk.linkStrRange)
	}

}
