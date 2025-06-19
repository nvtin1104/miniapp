import PageMeta from "@/components/common/PageMeta";
import SignInForm from "./common/SignInForm";
import GridShape from "@/components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

export default function Login() {
  return (
    <>
      <PageMeta
        title="Đăng nhập - Quản lý Miniapp"
        description="Đăng nhập vào hệ thống quản lý miniapp của Tín"
      />
      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
          <SignInForm />
          <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
            <div className="relative flex items-center justify-center z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link to="/" className="block mb-4">
                  <img
                    width={231}
                    height={48}
                    src="/images/logo/auth-logo.svg"
                    alt="Logo"
                  />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Hệ thống quản lý miniapp của Tín
                </p>
              </div>
            </div>
          </div>
          <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </div>
    </>
  );
}
