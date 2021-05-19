import { Card } from '@prisma/client';
import { SPLIT_MESSAGE } from '../models/Const';

const TAG_KEY = ' / tags:';

export function createCards(text: string) {
  // // 先頭のSPLIT_MESSAGEを削除
  // const re = new RegExp('^' + SPLIT_MESSAGE);
  // let tmp = text.replace(re, '').trim();
  const tmp = text.replaceAll('\r\n', '\n');
  const msgs = tmp.split(SPLIT_MESSAGE + '\n');
  //const msgs = text.split(/\r\n|\n/);
  const now = new Date();
  const cards = msgs
    .map((m) => {
      // const lines = m.split(/\r\n|\n/);
      const lines = m.split('\n');
      //const check = lines.map((l) => l.trim());

      if (lines.length > 0) {
        // 空の場合はスキップ
        if (lines[0].trim().length == 0) return undefined;
        // 1行目の # を探す
        const head = lines[0];
        let title = '';
        let id = 0;
        let tags = '';
        if (head.length > 0 && head[0] == '#') {
          // idを探す
          //const m = head.match(/\(id:\d+\)/g);
          const m = head.match(/\(id:\d+/g);
          if (m != null) {
            // idがある場合
            const tmp = m[0].match(/\d+/g) || ['0'];
            id = parseInt(tmp[0]);
            const idPos = head.indexOf('(id:');
            title = head.substring(1, idPos).trim();
            const tagPos = head.indexOf(TAG_KEY);
            if (tagPos > 0) {
              tags = head.substring(tagPos + TAG_KEY.length);
              tags = tags.replace(')', '').trim();
            }
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
            tags: tags,
            createdDate: now,
            updatedDate: now,
          };
        } else {
          // 更新の場合
          return {
            id: id,
            title: title,
            text: lines.slice(1).join('\n'),
            tags: tags,
            updatedDate: now,
          };
        }
      }
      return undefined;
    })
    .filter((x) => x);

  return cards;
}
