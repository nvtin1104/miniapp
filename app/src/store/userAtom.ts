import { UserInfo } from '@/types/user.types';
import { atom } from 'jotai';

export const userInfo = atom < UserInfo | (null)>;
