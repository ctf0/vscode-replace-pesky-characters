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
    let regex = new RegExp(Object.keys(getConfig().chars).join('|'), 'gi')

    if (!checkForExclusions(fileName)) {
        if (needChanges(txt, regex)) {
            let fullRange = new vscode.Range(
                doc.positionAt(0),
                doc.positionAt(txt.length - 1)
            )

            await editor.edit((edit) => edit.replace(fullRange, replaceWith(txt, regex)))

            return vscode.window.showInformationMessage('Replace Pesky Characters: all done')
        }

        return false
    }
}

function needChanges(txt, regex) {
    return regex.test(txt)
}

function checkForExclusions(fileName) {
    let exclude = getConfig().exclude

    return exclude.some((el) => fileName.includes(el))
}

function replaceWith(txt, regex) {
    let mapObj = getConfig().chars

    return txt.replace(regex, (matched) => mapObj[matched.toLowerCase()])
}

function getConfig() {
    return vscode.workspace.getConfiguration('replace-pesky-characters')
}

function deactivate() {
}
exports.deactivate = deactivate
