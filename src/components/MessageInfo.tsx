import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import unified from 'unified';
import remarkParse from 'remark-parse';
import remark2rehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehype2react from 'rehype-react';
import { textState, fileNameState } from '../models/State';
import { SPLIT_MESSAGE } from '../models/Const';

const msgHeaderDiv: React.FC = (props) => {
  return <div className="msg-header">{props.children}</div>;
};

const processor = unified()
  .use(remarkParse)
  .use(remark2rehype)
  .use(rehypeStringify)
  .use(rehype2react, {
    createElement: React.createElement,
    components: { h1: msgHeaderDiv },
  });

const splitInfos = (text: string) => {
  //return text.split(SPLIT_MESSAGE);
  const msgs = text.split(SPLIT_MESSAGE);
  return msgs.map((msg) =>
    msg
      .split(/\r\n|\n/)
      .filter((_, idx) => idx < 5)
      .map((x) => (x.length > 30 ? x.substring(0, 30) + '...' : x))
      .join('\n')
  );
};

const MessageInfo: React.FC = () => {
  const text = useRecoilValue(textState);
  const msgs = splitInfos(text);

  return (
    <div className="inbox-messages" id="inbox-messages">
      {msgs.map((msg, index) => {
        return (
          <div className="card" key={index}>
            <div className="card-content">
              {processor.processSync(msg).result as string}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageInfo;

{
  /* <div className="card">
<div className="card-content">
  <div className="msg-header">
    <span className="msg-from">
      <small>From: bbb</small>
    </span>
    <span className="msg-timestamp"></span>
    <span className="msg-attachment">
      <i className="fa fa-paperclip"></i>
    </span>
  </div>
  <div className="msg-subject">
    <span className="msg-subject">
      <strong id="fake-subject-1">ccc</strong>
    </span>
  </div>
  <div className="msg-snippet">
    <span id="fake-snippet-1">ddd</span>
  </div>
</div>
</div>; */
}
