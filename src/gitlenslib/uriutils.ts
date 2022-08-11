/*

The MIT License (MIT)

Copyright (c) 2021-2022 Axosoft, LLC dba GitKraken ("GitKraken")
Copyright (c) 2016-2021 Eric Amodio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import { Uri } from 'vscode'

export interface RevisionUriData {
	ref?: string,
	repoPath: string
}

function encodeUtf8Hex(s: string): string {
	return Buffer.from(s, 'utf8').toString('hex')
}

function decodeUtf8Hex(hex: string): string {
	return Buffer.from(hex, 'hex').toString('utf8')
}

export function decodeGitLensRevisionUriAuthority(authority: string): RevisionUriData {
	return JSON.parse(decodeUtf8Hex(authority)) as RevisionUriData
}

export function encodeGitLensRevisionUriAuthority(metadata: RevisionUriData): string {
	return encodeUtf8Hex(JSON.stringify(metadata))
}

const isWindows = process.platform === 'win32'
const isLinux = process.platform === 'linux'

const slash = 47 //slash;

const driveLetterNormalizeRegex = /(?<=^\/?)([A-Z])(?=:\/)/
const hasSchemeRegex = /^([a-zA-Z][\w+.-]+):/
const pathNormalizeRegex = /\\/g

function normalizePath(path: string): string {
	if (!path) {return path}

	path = path.replace(pathNormalizeRegex, '/')
	if (path.charCodeAt(path.length - 1) === slash) {
		// Don't remove the trailing slash on Windows root folders, such as z:\
		if (!isWindows || path.length !== 3 || path[1] !== ':') {
			path = path.slice(0, -1)
		}
	}

	if (isWindows) {
		// Ensure that drive casing is normalized (lower case)
		path = path.replace(driveLetterNormalizeRegex, d => d.toLowerCase())
	}

	return path
}

function maybeUri(path: string): boolean {
	return hasSchemeRegex.test(path)
}

function isAbsolute(path: string): boolean {
	return !maybeUri(path)
}

function commonBaseIndex(s1: string, s2: string, delimiter: string, ignoreCase?: boolean): number {
	if (s1.length === 0 || s2.length === 0) {return 0}

	if (ignoreCase ?? !isLinux) {
		s1 = s1.toLowerCase()
		s2 = s2.toLowerCase()
	}

	let char
	let index = 0
	for (let i = 0; i < s1.length; i++) {
		char = s1[i]
		if (char !== s2[i]) {break}

		if (char === delimiter) {
			index = i
		}
	}

	return index
}

function relative(from: string, to: string, ignoreCase?: boolean): string {
	from = hasSchemeRegex.test(from) ? Uri.parse(from, true).path : normalizePath(from)
	to = hasSchemeRegex.test(to) ? Uri.parse(to, true).path : normalizePath(to)

	const index = commonBaseIndex(`${to}/`, `${from}/`, '/', ignoreCase)
	return index > 0 ? to.substring(index + 1) : to
}

function getAbsoluteUri(pathOrUri: string | Uri, base: string | Uri): Uri {
    // Convert the base to a Uri if it isn't one
    if (typeof base === 'string') {
        // If it looks like a Uri parse it
        if (maybeUri(base)) {
            base = Uri.parse(base, true)
        } else {
            if (!isAbsolute(base)) {
                throw new Error(`Base path '${base}' must be an absolute path`)
            }

            base = Uri.file(base)
        }
    }

    // Short-circuit if the path is relative
    if (typeof pathOrUri === 'string' && !isAbsolute(pathOrUri)) {
        return Uri.joinPath(base, normalizePath(pathOrUri))
    }

    const relativePath = getRelativePath(pathOrUri, base)
    return Uri.joinPath(base, relativePath)
}

function getRelativePath(pathOrUri: string | Uri, base: string | Uri): string {
    // Convert the base to a Uri if it isn't one
    if (typeof base === 'string') {
        // If it looks like a Uri parse it
        if (maybeUri(base)) {
            base = Uri.parse(base, true)
        } else {
            if (!isAbsolute(base)) {
                throw new Error(`Base path '${base}' must be an absolute path`)
            }

            base = Uri.file(base)
        }
    }

    // Convert the path to a Uri if it isn't one
    if (typeof pathOrUri === 'string') {
        if (maybeUri(pathOrUri)) {
            pathOrUri = Uri.parse(pathOrUri, true)
        } else {
            if (!isAbsolute(pathOrUri)) {return normalizePath(pathOrUri)}

            pathOrUri = Uri.file(pathOrUri)
        }
    }

    const relativePath = relative(base.fsPath, pathOrUri.fsPath)
    return normalizePath(relativePath)
}

const shaRegex = /(^[0-9a-f]{40}$)|(^[0]{40}(:|-)$)/

function isMatch(regex: RegExp, ref: string | undefined) {
	return !ref ? false : regex.test(ref)
}

function isSha(ref: string) {
    return isMatch(shaRegex, ref)
}

export function getRevisionUri(repoPath: string, path: string, ref: string): Uri {
    const label = isSha(ref) ? ref.slice(0, 7) : ref

    path = normalizePath(getAbsoluteUri(path, repoPath).fsPath)
    if (path.charCodeAt(0) !== slash) {
        path = `/${path}`
    }

    const metadata: RevisionUriData = {
        ref,
        repoPath: normalizePath(repoPath),
    }

    const uri = Uri.from({
        scheme: 'gitlens',
        authority: encodeGitLensRevisionUriAuthority(metadata),
        path,
        query: label ? JSON.stringify({ ref: label }) : undefined,
    })
    return uri
}
