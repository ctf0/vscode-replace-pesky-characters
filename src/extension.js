'use strict'

const vscode = require('vscode')
let {subscribeToDocumentChanges, PESKY} = require('./diagnostics')
let {checkForExclusions, readConfig, PACKAGE_NAME} = require('./util')

let config = {}

async function activate(context) {
    setContext(false)

    config = await readConfig()

    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(PACKAGE_NAME)) {
            config = await readConfig()
        }
    })

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            [
                {scheme: 'file'},
                {scheme: 'untitled'}
            ],
            new charBulb(),
            {providedCodeActionKinds: charBulb.providedCodeActionKinds}
        )
    )

    const peskyDiagnostics = vscode.languages.createDiagnosticCollection(PESKY)
    context.subscriptions.push(peskyDiagnostics)

    subscribeToDocumentChanges(context, peskyDiagnostics, config.chars)

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.replacePeskyCharacters', () => applyReplacements())
    )
}

async function applyReplacements() {
    let editor = vscode.window.activeTextEditor
    let doc = editor.document
    let txt = doc.getText()
    let fileName = doc.fileName

    if (!checkForExclusions(fileName)) {
        let fullRange = new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(txt.length - 1)
        )

        await editor.edit((edit) => edit.replace(fullRange, replaceWith(txt)))

        if (config.showNotif) {
            return vscode.window.showInformationMessage('Replace Pesky Characters: all done')
        }
    }
}

function replaceWith(txt) {
    let keys = Object.keys(config.chars)

    return txt.replace(getRegex(keys), (matched) => getReplacement(matched))
}

function getReplacement(match) {
    return config.chars[match.toLowerCase()]
}

function getRegex(keys, global = true) {
    return new RegExp(keys.join('|'), global ? 'g' : '' + 'i')
}

function setContext(val, key = 'peskyEnabled') {
    vscode.commands.executeCommand('setContext', key, val)
}

/* code action --------------------------------------------------------------------- */
class charBulb {
    static providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ]

    provideCodeActions(document, range) {
        let list = config.chars
        let keys = Object.keys(list)

        if (!this.hasPeskyChar(document, range, keys) || checkForExclusions(document.fileName)) {
            setContext(false)

            return
        } else {
            setContext(true)
        }

        let item

        document.lineAt(range.start.line)
            .text
            .replace(getRegex(keys, false), (match, offset) => {
                let r = new vscode.Range(range.start.line, offset, range.start.line, offset + match.length)
                item = this.createFix(document, r, match, getReplacement(match))
                item.isPreferred = true
            })

        return [item, this.createCommand()]
    }

    hasPeskyChar(document, range, keys) {
        const start = range.start
        const line = document.lineAt(start.line)

        return getRegex(keys).test(line.text)
    }

    createFix(document, range, key, val) {
        const fix = new vscode.CodeAction(`pesky: ${key}`, vscode.CodeActionKind.QuickFix)
        fix.edit = new vscode.WorkspaceEdit()
        fix.edit.replace(document.uri, range, val)

        return fix
    }

    createCommand() {
        const action = new vscode.CodeAction('pesky: fix all', vscode.CodeActionKind.QuickFix)
        action.command = {
            command: 'extension.replacePeskyCharacters',
            title  : 'Replace Pesky Characters',
            tooltip: 'Replaces Annoying Characters'
        }

        return action
    }
}

exports.activate = activate

function deactivate() {
}

exports.deactivate = deactivate
