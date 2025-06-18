import { useRequestInformation } from "@/hooks/userHooks";
import registerIllusRight from "@/static/register-illus-right.svg";
import { userInfoState } from "@/store/userAtom";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export default function Register() {
  const [userData, setUserData] = useState(null);

  const requestInfo = useRequestInformation();

  const handleClick = async () => {
    const info = await requestInfo();
    setUserData(info as any);
    console.log("User info:", info);
  };
  return (
    <button
      className="w-full text-left rounded-lg bg-primary text-white p-4 bg-cover space-y-0.5"
      style={{
        backgroundImage: `url(${registerIllusRight})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom right",
        backgroundSize: "auto",
      }}
      onClick={handleClick}
    >
      <div className="text-lg">Đăng ký thành viên</div>
      <div className="text-2xs">Đăng ký thành viên để nhận nhiều ưu đãi</div>
    </button>
  );
}
