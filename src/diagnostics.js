/** To demonstrate code actions associated with Diagnostics problems, this file provides a mock diagnostics entries. */
const vscode = require('vscode')

const PESKY = 'peskyCharacters'

/**
 * Analyzes the text document for problems.
 * This demo diagnostic problem provider finds all mentions of 'emoji'.
 * @param doc text document to analyze
 * @param peskyDiagnostics diagnostic collection
 */
function refreshDiagnostics(doc, peskyDiagnostics, charsList) {
    let diagnostics = []
    let regex = new RegExp(Object.keys(charsList).join('|'), 'i')

    for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
        const lineOfText = doc.lineAt(lineIndex)
        let matches = lineOfText.text.match(regex)

        if (matches) {
            for (const char of matches) {
                diagnostics.push(createDiagnostic(lineOfText, lineIndex, char))
            }
        }
    }

    peskyDiagnostics.set(doc.uri, diagnostics)
}

function createDiagnostic(lineOfText, lineIndex, char) {
    let index = lineOfText.text.indexOf(char)
    let range = new vscode.Range(lineIndex, index, lineIndex, index + char.length)
    let diagnostic = new vscode.Diagnostic(
        range,
        `"${char}" is a pesky character & should be replaced`,
        vscode.DiagnosticSeverity.Warning
    )
    diagnostic.source = PESKY

    return diagnostic
}

function subscribeToDocumentChanges(context, peskyDiagnostics, charsList) {
    if (vscode.window.activeTextEditor) {
        refreshDiagnostics(vscode.window.activeTextEditor.document, peskyDiagnostics, charsList)
    }

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                refreshDiagnostics(editor.document, peskyDiagnostics, charsList)
            }
        })
    )

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => refreshDiagnostics(e.document, peskyDiagnostics, charsList))
    )

    context.subscriptions.push(
        vscode.workspace.onDidCloseTextDocument((doc) => peskyDiagnostics.delete(doc.uri))
    )
}

module.exports = {
    PESKY,
    subscribeToDocumentChanges
}
