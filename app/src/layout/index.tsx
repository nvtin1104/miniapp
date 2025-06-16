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

export default function Layout() {
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserID = async () => {
      const userId = await getUserID({});
      console.log(userId);
      setUserID(userId); 
    };
    fetchUserID();
  }, []);

const { data, loading, error } = useQuery(GET_USER_INFO, {
  variables: { code: userID },
  skip: !userID,                    // ← đẩy skip ra ngoài variables
  fetchPolicy: 'network-only',      // ← cũng phải là option chứ không phải biến
});

  useEffect(() => {
    if (data) console.log(data);
    if (error) console.log(error);
  }, [data, error]);

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
