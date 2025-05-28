import { AppSidebar } from "../app-sidebar";
import { NavBar } from "../app-navbar";

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

        <div className="h-[92%]"> {children}</div>
      </div>
    </div>
  );
}
