import * as vscode from 'vscode'
import {TextDocument, Position} from 'vscode'
import {getSnippet, getLinkAtPosition, LinkBlock, LinkToCode} from './link'

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
		return this.hoverForFetchCommand(linkBlk, position)
	}

	private async fileUri(link: LinkToCode) {
		const fileUri = (await link.toUri())?.with({ fragment: link.fragment })
		if (!fileUri) {
			return undefined
		}
		return fileUri
	}

	private async hoverForFetchCommand(linkBlk: LinkBlock, position: Position) {
		const link = linkBlk.link
		const snippet = await getSnippet(link)
		if (!snippet) {
			return undefined
		}
		const snippetMd = new vscode.MarkdownString(undefined)
		snippetMd.appendCodeblock(snippet, 'typescript')
		const fileUri = await this.fileUri(link)
		if (!fileUri) {
			return undefined
		}
		const md = new vscode.MarkdownString(undefined, true)
		md.appendText(fileUri.toString() + '\n')
		const cmdlink = vscode.Uri.parse('command:linktocode.paste-snippet').with({
			query: JSON.stringify({
				snippet: snippetMd.value.trimLeft(),
				line: position.line + 1
			})
		})
		md.appendMarkdown(`[Fetch](${cmdlink})`)
		md.isTrusted = true
		return new vscode.Hover(md, linkBlk.linkStrRange)
	}

	private async hoveForReplaceCommand(linkBlk: LinkBlock) {
		if (!linkBlk.codeBlockRange) {
			return undefined
		}
		const link = linkBlk.link
		const snippet = await getSnippet(link)
		if (!snippet) {
			return undefined
		}
		const fileUri = await this.fileUri(link)
		if (!fileUri) {
			return undefined
		}
		const snippetMd = new vscode.MarkdownString(undefined, true)
		snippetMd.appendCodeblock(snippet, 'typescript')
		const md = new vscode.MarkdownString(undefined, true)
		md.appendText(fileUri.toString() + '\n')
		const cmdlink = vscode.Uri.parse('command:linktocode.replace-snippet').with({
			query: JSON.stringify({
				snippet: snippetMd.value.trim(),
				start: linkBlk.codeBlockRange.start.line,
				end: linkBlk.codeBlockRange.end.line
			})
		})
		const removeCmd = vscode.Uri.parse('command:linktocode.replace-snippet').with({
			query: JSON.stringify({
				snippet: '',
				start: linkBlk.codeBlockRange.start.line,
				end: linkBlk.codeBlockRange.end.line
			})
		})
		md.appendMarkdown(`[Update](${cmdlink}) &nbsp; &nbsp; &nbsp; [Remove](${removeCmd})`)
		md.isTrusted = true
		return new vscode.Hover(md, linkBlk.linkStrRange)
	}
}
