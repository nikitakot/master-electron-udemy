const { autoUpdater } = require('electron-updater')
const { dialog } = require('electron')

autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = "info"

autoUpdater.autoDownload = false

module.exports = () => {
    autoUpdater.checkForUpdates()
    
    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update available',
            message: 'Update to the newer version?',
            buttons: ['Update', 'No']
        }, buttonIndex => {
            if (buttonIndex === 0) autoUpdater.downloadUpdate()
        })
    })

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update ready',
            message: 'Update and restart the app?',
            buttons: ['Yes', 'Later']
        }, buttonIndex => {
            if (buttonIndex === 0) autoUpdater.quitAndInstall(false, true)
        })
    })
}