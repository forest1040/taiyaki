/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { Card, Content, PrismaClient } from '@prisma/client';
import MenuBuilder from './menu';
import {
  FILE_EVENTS,
  readFile,
  saveFile,
  FileInfoType,
  FILE_FILTERS,
} from './fileIO';

const prisma = new PrismaClient();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    // width: 1024,
    // height: 728,
    width: 2048,
    height: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// ファイルを開く
ipcMain.on(FILE_EVENTS.OPEN_DIALOG, () => {
  if (mainWindow === null) return;
  const fileNames: string[] | undefined = dialog.showOpenDialogSync(
    mainWindow,
    {
      properties: ['openFile'],
      filters: FILE_FILTERS,
    }
  );
  if (!fileNames || !fileNames.length) return;
  const fileText = readFile(fileNames[0]);
  mainWindow.webContents.send(FILE_EVENTS.OPEN_FILE, {
    fileName: fileNames[0],
    fileText,
  });
});

// 名前をつけて保存する
ipcMain.on(FILE_EVENTS.SAVE_DIALOG, (_, fileInfo: FileInfoType) => {
  if (mainWindow === null) return;
  const newFileName: string | undefined = dialog.showSaveDialogSync(
    mainWindow,
    {
      defaultPath: fileInfo.fileName,
      filters: FILE_FILTERS,
    }
  );
  if (!newFileName) return;
  saveFile(newFileName, fileInfo.fileText);
  mainWindow.webContents.send(FILE_EVENTS.SAVE_FILE, newFileName);
});

async function getContents() {
  return await prisma.content.findMany();
}

ipcMain.handle('load-contents', (event, message) => {
  console.log(message);
  return getContents();
});

async function createContent(content: Content) {
  return await prisma.content.create({
    data: content,
  });
}

ipcMain.handle('create-content', (event, content: Content) => {
  console.log(content);
  return createContent(content);
});

async function getCards() {
  return await prisma.card.findMany();
}

ipcMain.handle('load-cards', (event, message) => {
  console.log(message);
  return getCards();
});

async function createCard(card: Card) {
  console.log('createCard');
  console.log(card.text);
  await prisma.card.create({
    data: card,
  });
}

async function updateCard(card: Card) {
  console.log('updateCard');
  console.log(card.text);
  // const hoge = await prisma.card.findMany({
  //   where: {
  //     OR: [{ title: { contains: 'prisma' } }, { text: { contains: 'prisma' } }],
  //   },
  // });
  await prisma.card.updateMany({
    where: {
      id: card.id,
      OR: [{ title: { not: card.title } }, { text: { not: card.text } }],
    },
    data: card,
  });

  // await prisma.card.update({
  //   where: {
  //     //AND: [{ id: card.id }, OR:[ {title: card.title}, {text: card.text}]],
  //     OR:[ {title: {eq: card.title}}, {text: {eq: card.text}}]]
  //   },
  //   data: card,
  // });
}

async function createCards(cards: Card[]) {
  //await prisma.card.deleteMany();
  cards.map((card) => {
    if (card.id == undefined) {
      createCard(card);
    } else {
      updateCard(card);
    }
  });
}

ipcMain.handle('create-cards', (event, cards: Card[]) => {
  //console.log(content);
  return createCards(cards);
});

async function deleteCards() {
  await prisma.card.deleteMany();
}

ipcMain.handle('delete-cards', (event, message) => {
  //console.log(content);
  return deleteCards();
});
