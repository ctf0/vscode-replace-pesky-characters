const vscode = require('vscode')
let config = {}
const PACKAGE_NAME = 'replace-pesky-characters'

function checkForExclusions(fileName) {
    let exclude = config.exclude

    return exclude.some((el) => fileName.includes(el))
}

async function readConfig() {
    config = await vscode.workspace.getConfiguration(PACKAGE_NAME)

    return config
}

module.exports = {
    checkForExclusions,
    readConfig,
    PACKAGE_NAME
}
