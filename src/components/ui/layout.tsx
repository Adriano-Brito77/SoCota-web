import { AppSidebar } from "../../app/_components/app-sidebar";
import { NavBar } from "../../app/_components/app-navbar";
import { Bounce, ToastContainer } from "react-toastify";

export default function LayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">
      <AppSidebar />

      <div
        style={{
          width: "calc(100% - 16rem)",
        }}
      >
        <NavBar />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
        />

        <div className="h-[92%]"> {children}</div>
      </div>
    </div>
  );
}
