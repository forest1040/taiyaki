import { atom, selector } from 'recoil';

export const textState = atom({
  key: 'textState',
  default: '',
});

export const fileNameState = atom({
  key: 'fileNameState',
  default: '',
});

// export const allLists = selector({
//   key: 'allLists',
//   get: ({ get }) => {
//     return get(listState);
//   },
// });
