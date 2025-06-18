import { UserInfoSkeleton } from "@/components/skeleton";
import TransitionLink from "@/components/transition-link";
import { useAtomValue } from "jotai";
import { PropsWithChildren } from "react";
import { Icon } from "zmp-ui";
import Register from "./register";
import { loadableUserInfoState, userZalo } from "@/store/userAtom";

function UserInfo({ children }: PropsWithChildren) {
  const loadableUserInfo = useAtomValue(loadableUserInfoState);
  const userInfo = useAtomValue(userZalo);
  if (userInfo?.isZaloActive) {
    return (
      <>
        <div className="bg-section rounded-lg p-4 flex items-center space-x-4 border-[0.5px] border-black/15">
          <img className="rounded-full h-10 w-10" src={userInfo?.avatar?.path} />
          <div className="space-y-0.5 flex-1 overflow-hidden">
            <div className="text-lg truncate">{userInfo?.name}</div>
            <div className="text-sm text-subtitle truncate">{userInfo?.phone}</div>
          </div>
          <TransitionLink to="/profile/edit">
            <Icon icon="zi-edit-text" />
          </TransitionLink>
        </div>
        {children}
      </>
    );
  }

  if (loadableUserInfo.state === "loading") {
    return <UserInfoSkeleton />;
  }

  return <Register />;
}

export default UserInfo;
