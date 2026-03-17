import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/authContext";
import { Toaster } from "@/components/ui/sonner"
import { IoCheckmarkCircle } from "react-icons/io5";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} `}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          icons={{
            success: <IoCheckmarkCircle color="green" size={24} />
          }}
          style={{
            backgroundColor: 'white',
            paddingLeft: '10px',
          }}
          toastOptions={
            {
              classNames: {
                title: "text-base text-black font-medium ml-2  ",
                toast: "bg-white border pl-2 border-zinc-800 text-black shadow-lg",

              }
            }
          }
        />

      </body>
    </html>
  );
}
