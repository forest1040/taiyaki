import React, { useState, useEffect, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { ipcRenderer } from 'electron';
import { Card } from '@prisma/client';
import SideBar from './SideBar';
import InfoActionButtons from './InfoActionButtons';
import PreviewActionButtons from './PreviewActionButtons';
import Footer from './Footer';
import MessageInfo from './MessageInfo';
import MessagePreview from './MessagePreview';
import { FILE_EVENTS, saveFile, FileInfoType } from '../fileIO';
import { textState, fileNameState } from '../models/State';
import { SPLIT_MESSAGE } from '../models/Const';

const openFileDialog = (): void => {
  ipcRenderer.send(FILE_EVENTS.OPEN_DIALOG);
};

const openSaveAsDialog = (fileInfo: FileInfoType): void => {
  ipcRenderer.send(FILE_EVENTS.SAVE_DIALOG, fileInfo);
};

async function createCards(text: string) {
  // 先頭のSPLIT_MESSAGEを削除
  const re = new RegExp('^' + SPLIT_MESSAGE);
  let tmp = text.replace(re, '').trim();
  tmp = tmp.replaceAll('\r\n', '\n');
  const msgs = tmp.split(SPLIT_MESSAGE + '\n');
  //const msgs = text.split(/\r\n|\n/);
  const now = new Date();
  const cards = msgs.map((m) => {
    // const lines = m.split(/\r\n|\n/);
    const lines = m.split('\n');
    if (lines.length > 0) {
      // 1行目の # を探す
      const head = lines[0];
      let title = '';
      let id = 0;
      if (head.length > 0 && head[0] == '#') {
        // idを探す
        const m = head.match(/\(id:\d+\)/g);
        if (m != null) {
          // idがある場合
          const tmp = m[0].match(/\d+/g) || ['0'];
          id = parseInt(tmp[0]);
          const idPos = head.indexOf('(id:');
          title = head.substring(1, idPos).trim();
        } else {
          // titleのみ 「#」を除くため、substring(1)してtrimする
          title = head.substring(1).trim();
        }
      }

      if (id == 0) {
        // 新規
        return {
          title: title,
          text: title.length > 0 ? lines.slice(1).join('\n') : m,
          createdDate: now,
          updatedDate: now,
        };
      } else {
        // 更新の場合
        return {
          id: id,
          title: title,
          text: lines.slice(1).join('\n'),
          updatedDate: now,
        };
      }
    }
    return undefined;
  });
  if (cards.length > 0) {
    await ipcRenderer.invoke('create-cards', cards);
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
    return `${SPLIT_MESSAGE}
# ${card.title} (id:${card.id})
${card.text}`;
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
    createCards(text);
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
            onSaveDate={handleDBSave}
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
