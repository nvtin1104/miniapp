import { useQuery } from "@apollo/client";
import ProfileActions from "./actions";
import FollowOA from "./follow-oa";
import Points from "./points";
import UserInfo from "./user-info";
import { GET_PROFILE } from "@/graphql/queries/user.query";
import { useEffect } from "react";
import { useAtom } from "jotai";
import { userZalo } from "@/store/userAtom";

export default function ProfilePage() {
  const [userInfo, setUserInfo] = useAtom(userZalo);
  const { data } = useQuery(GET_PROFILE,
    {
      fetchPolicy: 'network-only',
    }
  );
  useEffect(() => {
    if (data) {
      setUserInfo(data.miniAppMe);
    }
  }, [data]);
  return (
    <div className="min-h-full bg-background p-4 space-y-2.5">
      <UserInfo>
        <Points />
      </UserInfo>
      <ProfileActions />
      <FollowOA />
    </div>
  );
}
