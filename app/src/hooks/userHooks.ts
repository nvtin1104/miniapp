import { userInfoKeyState, userInfoState } from "@/store/userAtom";
import { useSetAtom } from "jotai";
import { useAtomCallback } from "jotai/utils";
import { authorize, getAccessToken } from "zmp-sdk";

export function useRequestInformation() {
    const getStoredUserInfo = useAtomCallback(async (get) => {
        const userInfo = await get(userInfoState);
        return userInfo;
    });
    const setInfoKey = useSetAtom(userInfoKeyState);
    const refreshPermissions = () => setInfoKey((key) => key + 1);

    return async () => {
        try {
            const userInfo = await getStoredUserInfo();
            if (!userInfo) {
                try {
                    await authorize({
                        scopes: ["scope.userInfo", "scope.userPhonenumber"],
                    });
                    refreshPermissions();
                    await new Promise(r => setTimeout(r, 200));
                    return await getStoredUserInfo();
                } catch (authError) {
                    console.error("Authorization error:", authError);
                    throw authError;
                }
            }
            return userInfo;
        } catch (error) {
            console.error("Error in useRequestInformation:", error);
            throw error;
        }
    };
}
