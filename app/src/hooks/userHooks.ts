import { userInfoKeyState, userInfoState } from "@/store/userAtom";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { authorize } from "zmp-sdk";

export function useRequestInformation() {
    const getStoredUserInfo = useAtomCallback(async (get) => {
        const userInfo = await get(userInfoState);
        return userInfo;
    });
    const setInfoKey = useSetAtom(userInfoKeyState);
    const refreshPermissions = () => setInfoKey((key) => key + 1);

    return async () => {
        const userInfo = await getStoredUserInfo();
        if (!userInfo) {
            await authorize({
                scopes: ["scope.userInfo", "scope.userPhonenumber"],
            });
            refreshPermissions();
            await new Promise(r => setTimeout(r, 200));
            return await getStoredUserInfo();
        }
        return userInfo;
    };
}
