import React, { useState, useEffect, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { ipcRenderer } from 'electron';
import { Card } from '@prisma/client';
import SideBar from './SideBar';
import InfoActionButtons from './PreviewActionButtons';
import PreviewActionButtons from './EditActionButtons';
import Footer from './Footer';
import MessageInfo from './CardPreview';
import MessagePreview from './CardEdit';
import { FILE_EVENTS, saveFile, FileInfoType } from '../fileIO';
import { textState, fileNameState } from '../models/State';
import { SPLIT_MESSAGE } from '../models/Const';
import { createCards } from '../models/Card';

const openFileDialog = (): void => {
  ipcRenderer.send(FILE_EVENTS.OPEN_DIALOG);
};

const openSaveAsDialog = (fileInfo: FileInfoType): void => {
  ipcRenderer.send(FILE_EVENTS.SAVE_DIALOG, fileInfo);
};

async function _createCards(text: string) {
  const cards = createCards(text);
  if (cards.length > 0) {
    return await ipcRenderer.invoke('create-cards', cards);
  }
}

async function loadCards() {
  // console.log(newContent);
  return await ipcRenderer.invoke('load-cards');
}

async function deleteCards() {
  // console.log(newContent);
  return await ipcRenderer.invoke('delete-cards');
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

  const viewCard = (card: Card): string => {
    return `# ${card.title} (id:${card.id} / tags:${card.tags})
${card.text}${SPLIT_MESSAGE}
`;
  };

  const handleDBLoad = useCallback(() => {
    loadCards().then((cards: Card[]) => {
      setText(
        cards
          .map((m) => {
            return viewCard(m);
          })
          .join('') + '\n'
      );
    });
  }, []);

  const handleDBSave = useCallback(() => {
    //createCards(text);
    _createCards(text).then((cards: Card[]) => {
      setText(
        cards
          .map((m) => {
            return viewCard(m);
          })
          .join('') + '\n'
      );
    });
  }, [text]);

  const handleDBDelete = useCallback(() => {
    deleteCards();
    setText('');
    setFileName('');
  }, []);

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
            onLoadData={handleDBLoad}
            onSaveData={handleDBSave}
            onAllClear={handleDBDelete}
          />
          <MessagePreview />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Board;
