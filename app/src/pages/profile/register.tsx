import { ACTIVE_USER } from "@/graphql/queries/user.query";
import { useRequestInformation } from "@/hooks/userHooks";
import registerIllusRight from "@/static/register-illus-right.svg";
import { useMutation } from "@apollo/client";
import { useState } from "react";

export default function Register() {
  const [userData, setUserData] = useState(null);

  const requestInfo = useRequestInformation();

  const [activeUser, { data, loading, error }] = useMutation(ACTIVE_USER, {
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error("Registration error:", error);
    },
    onCompleted: (data) => {
      console.log("Registration successful:", data);
    }
  });

  const handleClick = async () => {
    try {
      console.log("requestInfo");
      const info = await requestInfo();
      setUserData(info as any);
      console.log("info", info);
      if (info) {
        const { data } = await activeUser({
          variables: { data: info },
        });
      }
    } catch (err) {
      console.error("Error during registration:", err);
    }
  };

  return (
    <button
      className="w-full text-left rounded-lg bg-primary text-white p-4 bg-cover space-y-0.5 disabled:opacity-50"
      style={{
        backgroundImage: `url(${registerIllusRight})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom right",
        backgroundSize: "auto",
      }}
      onClick={handleClick}
      disabled={loading}
    >
      <div className="text-lg">
        {loading ? "Đang đăng ký..." : "Đăng ký thành viên"}
      </div>
      <div className="text-2xs">Đăng ký thành viên để nhận nhiều ưu đãi</div>
    </button>
  );
}
