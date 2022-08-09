import * as vscode from 'vscode'
import * as link from './linktocode'
import type {Extension} from './main'

export class LinkToCodeLinkProvider implements vscode.DocumentLinkProvider {
    private readonly linkReg = new RegExp(link.LinkToCodeRegExp.source, 'g')

    constructor(private readonly extension: Extension) {}

    async provideDocumentLinks(document: vscode.TextDocument) {
        const ret: vscode.DocumentLink[] = []
        for (let i = 0; i < document.lineCount; i++) {
            const curLine = document.lineAt(i).text
            while (true) {
                const m = this.linkReg.exec(curLine)
                if (!m) {
                    break
                }
                const linkStr = m[0]
                const linkToCodeObj = this.extension.linkFactory.fromLinkStr(linkStr, document)
                if (linkToCodeObj) {
                    const range = new vscode.Range(i, m.index, i, m.index + linkStr.length)
                    const uriObj = await this.extension.linkResolver.resolveLink(linkToCodeObj)
                    const uri = uriObj?.with({ fragment: linkToCodeObj.fragment })
                    ret.push(new vscode.DocumentLink(range, uri))
                }
            }

        }
        return ret
    }

}
