import * as vscode from 'vscode'

export type SnippetResource = {
    uri: vscode.Uri,
    start: number,
    end: number
}

export type SnippetArgs = {
    resource: {
        uri: string,
        start: number,
        end: number
    },
    targetRange: {
        start: { line: number, character: number },
        end: { line: number, character: number }
    }
}
