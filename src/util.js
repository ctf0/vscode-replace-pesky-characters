const vscode = require('vscode')
const PACKAGE_NAME = 'replacePeskyCharacters'
let config = {}

async function readConfig() {
    config = await vscode.workspace.getConfiguration(PACKAGE_NAME)
}

function getConfig() {
    return config
}

function checkForExclusions(fileName) {
    let exclude = getConfig().exclude

    return exclude.some((el) => fileName.includes(el))
}

module.exports = {
    readConfig,
    getConfig,
    checkForExclusions,
    PACKAGE_NAME
}
