import "./globals.css";
import ReactQueryProvider from "@/context/ReactQueryProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthContextProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
      
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="w-full h-full bg-zinc-100">
        <ReactQueryProvider>
          <AuthContextProvider>
            <SidebarProvider>
              {children}

              <ToastContainer position="top-center"  />
            </SidebarProvider>
          </AuthContextProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
