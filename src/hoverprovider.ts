import * as vscode from 'vscode'
import {TextDocument, Position} from 'vscode'
import {getLinkAtPosition, LinkBlock, LinkToCode} from './link'

export class HoverOnLinkProvider implements vscode.HoverProvider {

	async provideHover(document: TextDocument, position: Position) {
		const linkBlk = getLinkAtPosition(document, position)
		if (!linkBlk) {
			return undefined
		}
		if (linkBlk.codeBlockRange) {
			const hov = await this.hoveForReplaceCommand(linkBlk)
			if (hov) {
				return hov
			}
		}
		const link = linkBlk.link
		const snippet = await this.getSnippet(link)
		if (!snippet) {
			return undefined
		}
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

	private async getSnippet(link: LinkToCode) {
		const start = link.start
		const end = link.end
		const linkUri = await link.toUri()
		if (!linkUri) {
			return undefined
		}
		const doc = (await vscode.workspace.fs.readFile(linkUri)).toString()
		const arry = doc.split('\n').slice(start - 1, end)
		const snippet = arry.join('\n')
		return snippet
	}

	private async hoveForReplaceCommand(linkBlk: LinkBlock) {
		if (!linkBlk.codeBlockRange) {
			return undefined
		}
		const link = linkBlk.link
		const snippet = await this.getSnippet(link)
		if (!snippet) {
			return undefined
		}
		const md = new vscode.MarkdownString(undefined, true)
		md.appendCodeblock(snippet, 'typescript')
		const cmdlink = vscode.Uri.parse('command:linktocode.replace-snippet').with({
			query: JSON.stringify({
				snippet: md.value.trimLeft(),
				start: linkBlk.codeBlockRange.start.line,
				end: linkBlk.codeBlockRange.end.line
			})
		})
		md.appendMarkdown(`[Update](${cmdlink})`)
		md.isTrusted = true
		return new vscode.Hover(md, linkBlk.linkStrRange)
	}
}
