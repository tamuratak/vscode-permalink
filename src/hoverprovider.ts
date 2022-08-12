import * as vscode from 'vscode'
import { DocumentUtil, LinkBlock } from './hoverproviderlib/documentutil'
import type { Permalink } from './permalink'
import type { Extension } from './main'
import type { SnippetArgs, TargetRange } from './types/types'

export class HoverOnLinkProvider implements vscode.HoverProvider {
    private documentUtil: DocumentUtil

    constructor(private readonly extension: Extension) {
        this.documentUtil = new DocumentUtil(extension)
    }

    async provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const linkBlk = this.documentUtil.getLinkAtPosition(document, position)
        if (!linkBlk) {
            return undefined
        }
        if (linkBlk.codeBlockRange) {
            return this.hoveForRemoveCommand(linkBlk)
        } else {
            return this.hoverForFetchCommand(linkBlk, position)
        }
    }

    private async getFileUri(link: Permalink) {
        const uriObj = await this.extension.linkResolver.resolveLink(link)
        const fileUri = uriObj?.with({ fragment: link.fragment })
        if (!fileUri) {
            return undefined
        }
        return fileUri
    }

    private formatUri(uri: vscode.Uri): string {
        const beg = Math.max(uri.path.length - 20, 0)
        const path = uri.path.slice(beg)
        return `${uri.scheme}://...${path}#${uri.fragment}`
    }

    private async hoverForFetchCommand(linkBlk: LinkBlock, position: vscode.Position) {
        const link = linkBlk.link
        const fileUri = await this.getFileUri(link)
        if (!fileUri) {
            return undefined
        }
        const cmdlink = await this.commandLinkToFetch(linkBlk, position)
        if (!cmdlink) {
            return undefined
        }
        const mdArray: vscode.MarkdownString[] = []
        const codeBlock = await this.extension.fetcher.getSnippet(link)
        if (codeBlock === '') {
            mdArray.push(new vscode.MarkdownString('$(info) The code block is an empty line.', true))
        } else if (codeBlock) {
            const md = new vscode.MarkdownString(undefined)
            md.appendCodeblock(codeBlock, 'ts')
            mdArray.push(md)
            const fetchMd = new vscode.MarkdownString(`[Fetch](${cmdlink}) `)
            fetchMd.isTrusted = true
            fetchMd.appendText(`(${this.formatUri(fileUri)})\n`)
            mdArray.push(fetchMd)
        }
        return new vscode.Hover(mdArray, linkBlk.linkStrRange)
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
        const cmdlink = vscode.Uri.parse('command:permalink.paste-snippet').with({
            query: JSON.stringify(args)
        })
        return cmdlink
    }

    private async hoveForRemoveCommand(linkBlk: LinkBlock) {
        if (!linkBlk.codeBlockRange) {
            return undefined
        }
        const link = linkBlk.link
        const fileUri = await this.getFileUri(link)
        if (!fileUri) {
            return undefined
        }
        const removeCmd = this.commandLinkToRemove(linkBlk)
        if (!removeCmd) {
            return undefined
        }
        const md = new vscode.MarkdownString(undefined, true)
        md.appendMarkdown(`[Remove](${removeCmd}) `)
        md.appendText(`(${this.formatUri(fileUri)})\n`)
        md.isTrusted = true
        return new vscode.Hover(md, linkBlk.linkStrRange)
    }

    private commandLinkToRemove(linkBlk: LinkBlock): vscode.Uri | undefined {
        if (!linkBlk.codeBlockRange) {
            return undefined
        }
        const args: TargetRange = {
            start: { line: linkBlk.codeBlockRange.start.line, character: 0 },
            end: { line: linkBlk.codeBlockRange.end.line + 1, character: 0 }
        }
        const cmdlink = vscode.Uri.parse('command:permalink.remove-snippet').with({
            query: JSON.stringify(args)
        })
        return cmdlink
    }

}
