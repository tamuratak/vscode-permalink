import * as vscode from 'vscode'
import * as link from './link'
export class LinkToCodeLinkProvider implements vscode.DocumentLinkProvider {
    private readonly linkReg = new RegExp(link.reg.source, 'g')

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
                const linkObj = link.getLink(linkStr)
                if (linkObj) {
                    const range = new vscode.Range(i, m.index, i, m.index + linkStr.length)
                    const uri = await linkObj.toUri()
                    ret.push(new vscode.DocumentLink(range, uri))
                }
            }

        }
        return ret
    }

}
