'use strict'

const vscode = require('vscode')

function activate(context) {
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.replacePeskyCharacters', () => applyReplacements())
    )
}

exports.activate = activate

async function applyReplacements() {
    let editor = vscode.window.activeTextEditor

    if (!editor) return

    let doc = editor.document
    let txt = doc.getText()
    let fileName = doc.fileName

    if (!checkForExclusions(fileName)) {
        let fullRange = new vscode.Range(
            doc.positionAt(0),
            doc.positionAt(txt.length - 1)
        )

        let done = await editor.edit((edit) => edit.replace(fullRange, replaceWith(txt)))

        return done
    }
}

function checkForExclusions(fileName) {
    let exclude = getConfig().exclude

    return exclude.some((el) => fileName.includes(el))
}

function replaceWith(str) {
    let mapObj = getConfig().chars
    let keys = Object.keys(mapObj).join('|')

    return str.replace(new RegExp(keys, 'gi'), (matched) => mapObj[matched.toLowerCase()])
}

function getConfig() {
    return vscode.workspace.getConfiguration('replace_pesky_characters')
}

function deactivate() {
}
exports.deactivate = deactivate
