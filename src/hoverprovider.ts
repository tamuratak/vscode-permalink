import * as vscode from 'vscode'
import type { LinkBlock } from './documentutil'
import type { LinkToCode } from './linktocode'
import type { Extension } from './main'
import type { SnippetArgs, TargetRange } from './types/types'

export class HoverOnLinkProvider implements vscode.HoverProvider {

    constructor(private readonly extension: Extension) {}

    async provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const linkBlk = this.extension.documentUtil.getLinkAtPosition(document, position)
        if (!linkBlk) {
            return undefined
        }
        if (linkBlk.codeBlockRange) {
            const hov = await this.hoveForRemoveCommand(linkBlk)
            if (hov) {
                return hov
            }
        }
        return this.hoverForFetchCommand(linkBlk, position)
    }

    private async getFileUri(link: LinkToCode) {
        const uriObj = await this.extension.linkResolver.resolveLink(link)
        const fileUri = uriObj?.with({ fragment: link.fragment })
        if (!fileUri) {
            return undefined
        }
        return fileUri
    }

    private formatUri(uri: vscode.Uri): string {
        if (uri.scheme === 'gitlens') {
            const tmp = uri.with({authority: '...'})
            return tmp.toString()
        }
        return uri.toString()
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
        const md = new vscode.MarkdownString(undefined, true)
        md.appendCodeblock(this.formatUri(fileUri) + '\n')
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
        md.appendCodeblock(this.formatUri(fileUri) + '\n')
        md.appendMarkdown(`[Remove](${removeCmd})`)
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
        const cmdlink = vscode.Uri.parse('command:linktocode.remove-snippet').with({
            query: JSON.stringify(args)
        })
        return cmdlink
    }

}
