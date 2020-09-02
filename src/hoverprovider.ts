import * as vscode from 'vscode'
import {LinkBlock} from './documentutil'
import {getFileExt} from './fileext'
import {LinkToCode} from './link'
import type {Extension} from './main'
import type {SnippetArgs} from './types'

export class HoverOnLinkProvider implements vscode.HoverProvider {

	constructor(private readonly extension: Extension) {}

	async provideHover(document: vscode.TextDocument, position: vscode.Position) {
		const linkBlk = this.extension.documentUtil.getLinkAtPosition(document, position)
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
		const uriObj = await this.extension.linkResolver.resolveLink(link)
		const fileUri = uriObj?.with({ fragment: link.fragment })
		if (!fileUri) {
			return undefined
		}
		return fileUri
	}

	private async hoverForFetchCommand(linkBlk: LinkBlock, position: vscode.Position) {
		const link = linkBlk.link
		const fileUri = await this.fileUri(link)
		if (!fileUri) {
			return undefined
		}
		const cmdlink = await this.commandLinkToFetch(linkBlk, position)
		if (!cmdlink) {
			return undefined
		}
		const md = new vscode.MarkdownString(undefined, true)
		md.appendCodeblock(fileUri.toString() + '\n')
		md.appendMarkdown(`[Fetch](${cmdlink})`)
		md.isTrusted = true
		return new vscode.Hover(md, linkBlk.linkStrRange)
	}

	private async commandLinkToFetch(linkBlk: LinkBlock, position: vscode.Position): Promise<vscode.Uri | undefined> {
		const link = linkBlk.link
		const uriObj = await this.extension.linkResolver.resolveLink(link)
		if (uriObj === undefined) {
			return undefined
		}
		if (!link.targetCode) {
			return undefined
		}
		const uri = uriObj.toString()
		const {start, end} = link.targetCode
		const args: SnippetArgs = {
			resource: {
				uri, start, end
			},
			targetRange: {
				start: { line: position.line + 1, character: 0 },
				end: { line: position.line + 1, character: 0 }
			}
		}
		const cmdlink = vscode.Uri.parse('command:linktocode.paste-snippet').with({
			query: JSON.stringify(args)
		})
		return cmdlink
	}

	private async hoveForReplaceCommand(linkBlk: LinkBlock) {
		if (!linkBlk.codeBlockRange) {
			return undefined
		}
		const link = linkBlk.link
		const snippet = await this.extension.fetcher.getSnippet(link)
		if (!snippet) {
			return undefined
		}
		const fileUri = await this.fileUri(link)
		if (!fileUri) {
			return undefined
		}
		const snippetMd = new vscode.MarkdownString(undefined, true)
		const languageId = getFileExt(link)
		snippetMd.appendCodeblock(snippet, languageId)
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
