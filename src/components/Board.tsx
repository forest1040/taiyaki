import React, { useState, useEffect, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { ipcRenderer } from 'electron';
import { Content } from '@prisma/client';
import SideBar from './SideBar';
import InfoActionButtons from './InfoActionButtons';
import PreviewActionButtons from './PreviewActionButtons';
import Footer from './Footer';
import MessageInfo from './MessageInfo';
import MessagePreview from './MessagePreview';
import { FILE_EVENTS, saveFile, FileInfoType } from '../fileIO';
import { textState, fileNameState } from '../models/State';

const openFileDialog = (): void => {
  ipcRenderer.send(FILE_EVENTS.OPEN_DIALOG);
};

const openSaveAsDialog = (fileInfo: FileInfoType): void => {
  ipcRenderer.send(FILE_EVENTS.SAVE_DIALOG, fileInfo);
};

async function createContent(newContent: Content) {
  // console.log(newContent);
  await ipcRenderer.invoke('create-content', newContent);
}

async function loadContent() {
  // console.log(newContent);
  return await ipcRenderer.invoke('load-contents');
}

const Board: React.FC = () => {
  const [text, setText] = useRecoilState(textState);
  const [fileName, setFileName] = useRecoilState(fileNameState);

  // Dialog選択結果の取得
  useEffect(() => {
    ipcRenderer.on(FILE_EVENTS.OPEN_FILE, (_, fileInfo: FileInfoType) => {
      setText(fileInfo.fileText);
      setFileName(fileInfo.fileName);
    });
    ipcRenderer.on(FILE_EVENTS.SAVE_FILE, (_, newFileName: string) => {
      setFileName(newFileName);
    });

    return (): void => {
      ipcRenderer.removeAllListeners(FILE_EVENTS.OPEN_FILE);
      ipcRenderer.removeAllListeners(FILE_EVENTS.SAVE_FILE);
    };
  }, []);

  const handleFileSave = useCallback(() => {
    if (fileName) {
      saveFile(fileName, text);
    } else {
      openSaveAsDialog({
        fileName: '',
        fileText: text,
      });
    }
  }, [fileName, text]);

  const handleFileSaveAs = useCallback(() => {
    openSaveAsDialog({
      fileName: fileName,
      fileText: text,
    });
  }, [fileName, text]);

  const handleNew = useCallback(() => {
    setText('');
    setFileName('');
  }, []);

  const handleDBLoad = useCallback(() => {
    //createContent({ id: 0, text: text, updatedDate: now, createdDate: now });
    loadContent().then((contents: Content[]) => {
      if (contents[0] && contents[0].text) {
        setText(contents[0]?.text);
      }
    });
  }, []);

  const handleDBSave = useCallback(() => {
    const now = new Date();
    createContent({ id: 0, text: text, updatedDate: now, createdDate: now });
  }, [text]);

  return (
    <>
      <div className="columns" id="mail-app">
        <div className="column is-2 ">
          <SideBar onNew={handleNew} />
        </div>

        <div
          className="column is-3 messages hero is-fullheight"
          id="message-feed"
        >
          <InfoActionButtons
            onFileOpen={openFileDialog}
            onFileSave={handleFileSave}
            onFileSaveAs={handleFileSaveAs}
          />
          <MessageInfo />
        </div>

        <div
          className="column is-7 message hero is-fullheight"
          id="message-pane"
        >
          <PreviewActionButtons
            onFileOpen={handleDBLoad}
            onFileSave={handleDBSave}
            onFileSaveAs={handleFileSaveAs}
          />
          <MessagePreview />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Board;
