import { UserInfo } from '@/types/user.types';
import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import { getPhoneNumber, getSetting, getUserInfo } from 'zmp-sdk';

export const userZalo = atom<UserInfo | null>(null);
export const userInfoKeyState = atom(0);
export const userInfoState = atom<Promise<{ id: string; name: string; avatar: string; token: string } | null>>(async (get) => {
    get(userInfoKeyState);
    const user = get(userZalo);
    const {
        authSetting: {
            "scope.userInfo": grantedUserInfo,
            "scope.userPhonenumber": grantedPhoneNumber,
        },
    } = await getSetting({});
    const dataResult: { id: string; name: string; avatar: string; token: string } = {
        id: "",
        name: "",
        avatar: "",
        token: "",
    };

    if (grantedUserInfo && grantedPhoneNumber && !user?.isZaloActive) {
        const { userInfo } = await getUserInfo({});
        dataResult.id = userInfo.id;
        dataResult.name = userInfo.name;
        dataResult.avatar = userInfo.avatar;
        const { token } = await getPhoneNumber({});
        if (token) {
            dataResult.token = token;
        }
        return dataResult;

    }
    return null;

});

export const loadableUserInfoState = loadable(userInfoState);
