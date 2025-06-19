import { atom } from 'jotai';

export const authAtom = atom({
  isAuthenticated: false,
  token: '',
  user: null,
});
