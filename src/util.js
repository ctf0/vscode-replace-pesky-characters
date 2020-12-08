const vscode = require('vscode')
const PACKAGE_NAME = 'replacePeskyCharacters'
let config = {}

async function readConfig() {
    config = await vscode.workspace.getConfiguration(PACKAGE_NAME)
}

function checkForExclusions(fileName) {
    let exclude = config.exclude

    return exclude.some((el) => fileName.includes(el))
}

module.exports = {
    readConfig,
    config,
    checkForExclusions,
    PACKAGE_NAME
}
