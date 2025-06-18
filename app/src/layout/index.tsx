import { Outlet } from "react-router-dom";
import Header from "@/layout/common/header";
import Footer from "@/layout/common/footer";
import { Suspense, useEffect, useState } from "react";
import { PageSkeleton } from "@/components/skeleton";
import { Toaster } from "react-hot-toast";
import { ScrollRestoration } from "@/components/scroll-restoration";
import FloatingCartPreview from "@/components/floating-cart-preview";
import { useQuery } from "@apollo/client";
import { GET_USER_INFO } from "@/graphql/queries/user.query";
import { getUserID } from "zmp-sdk/apis";
import { useAtom } from "jotai";
import { userZalo } from "@/store/userAtom";
import { nativeStorage } from "zmp-sdk/apis";

export default function Layout() {
  const [userID, setUserID] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useAtom(userZalo);
  
  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const userId = await getUserID({});
        setUserID(userId);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    fetchUserID();
  }, []);

  const { data, loading, error } = useQuery(GET_USER_INFO, {
    variables: { code: userID },
    skip: !userID,
    fetchPolicy: 'network-only',
    onError: (error) => {
      console.error("Error fetching user info:", error);
    }
  });

  useEffect(() => {
    if (data?.miniAppLogin) {
      try {
        nativeStorage.setItem("accessToken", data.miniAppLogin.accessToken);
        setUserInfo(data.miniAppLogin.user);
      } catch (error) {
        console.error("Error setting user data:", error);
      }
    }
  }, [data, setUserInfo]);

  return (
    <div className="w-screen h-screen flex flex-col bg-section text-foreground">
      <Header />
      <div className="flex-1 overflow-y-auto bg-background">
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </div>
      <Footer />
      <Toaster
        containerClassName="toast-container"
        containerStyle={{
          top: "calc(50% - 24px)",
        }}
      />
      <FloatingCartPreview />
      <ScrollRestoration />
    </div>
  );
}
