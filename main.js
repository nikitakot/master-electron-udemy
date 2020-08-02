// Modules
const { app, BrowserWindow, ipcMain, TouchBar } = require('electron')
const windowStateKeeper = require('electron-window-state')
const readItem = require('./readItem')
const updater = require('./updater')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

const tbLabel = new TouchBar.TouchBarLabel({
  label: 'Theme:'
})

// Touch Bar Slider
const tbSlider = new TouchBar.TouchBarSlider({
  label: 'Size',
  minValue: 500,
  maxValue: 1000,
  value: 500,
  change: val => {
    mainWindow.setSize(val,val,true)
  }
})

// Touch Bar Button
const tbButton = new TouchBar.TouchBarButton({
  label: 'DevTools',
  icon: `${__dirname}/file-code-solid@2x.png`,
  iconPosition: 'left',
  click: () => {
    mainWindow.webContents.openDevTools()
  }
})

// Touch Bar Popover
const tbPopover = new TouchBar.TouchBarPopover({
  label: 'Size',
  items: new TouchBar({ items: [tbSlider] })
})

// Touch Bar Spacer
const tbSpacer = new TouchBar.TouchBarSpacer({
  size: 'flexible'
})

// Touch Bar Color Picker
const tbPicker = new TouchBar.TouchBarColorPicker({
  change: color => {
    mainWindow.webContents.insertCSS(`body{background-color:${color};}`)
  }
})

// Mac Touch Bar
const touchBar = new TouchBar({
  items: [
    tbLabel,
    tbPicker,
    tbPopover,
    tbSpacer,
    tbButton
  ]
})
// Listen for new item request
ipcMain.on('new-item', (e, itemUrl) => {

  // Get new item and send back to renderer
  readItem(itemUrl, item => {
    e.sender.send('new-item-success', item)
  })
})

// Create a new BrowserWindow when `app` is ready
function createWindow() {

  setTimeout(updater, 1500)

  // Win state keeper
  let state = windowStateKeeper({
    defaultWidth: 500, defaultHeight: 650
  })

  mainWindow = new BrowserWindow({
    x: state.x, y: state.y,
    width: state.width, height: state.height,
    minWidth: 350, maxWidth: 650, minHeight: 300,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Load index.html into the new BrowserWindow
  mainWindow.loadFile('renderer/main.html')

  // Set touch bar on Mac
  if (process.platform === 'darwin') mainWindow.setTouchBar(touchBar)

  // Manage new window state
  state.manage(mainWindow)

  // // Open DevTools - Remove for PRODUCTION!
  // mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Electron `app` is ready
app.on('ready', createWindow)

// Quit when all windows are closed - (Not macOS - Darwin)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on('activate', () => {
  if (mainWindow === null) createWindow()
})
