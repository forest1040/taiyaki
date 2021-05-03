import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import AceEditor from 'react-ace';
import { ipcRenderer } from 'electron';
import 'ace-builds/src-noconflict/mode-text';
import 'ace-builds/src-noconflict/theme-textmate';
import { FILE_EVENTS, saveFile, FileInfoType } from '../fileIO';
import { textState, fileNameState } from '../models/State';

// const EditorCommonSettings = {
//   mode: 'java',
//   theme: 'chrome',
//   tabSize: 2,
//   enableBasicAutocompletion: true,
//   height: 'inherit',
//   width: 'inherit',
// };

const MessagePreview: React.FC = () => {
  const [text, setText] = useRecoilState(textState);
  const [fileName, setFileName] = useRecoilState(fileNameState);

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

  return (
    <div className="box message-preview">
      <div className="top">
        {/* <div className="avatar">
          <img src="http://placehold.it/128x128" />
        </div>
        <div className="address">
          <div className="name">John Smith</div>
          <div className="email">someone@gmail.com</div>
        </div>
        <hr /> */}
        {/* <div className="content">
          Et qui laborum deleniti commodi ut quis id reprehenderit. Nesciunt
          similique id ratione. Dolores esse mollitia quia maiores rerum porro
        </div> */}
        <AceEditor
          name="EDITOR"
          height="600px"
          width="100%"
          fontSize="16px"
          mode="text"
          theme="textmate"
          value={text}
          onChange={(value) => {
            setText(value);
          }}
          editorProps={{ $blockScrolling: false }}
          showGutter={false}
          highlightActiveLine={false}
        />
      </div>
    </div>
  );
};

export default MessagePreview;
