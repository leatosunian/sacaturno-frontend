import { Montserrat } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/authContext";

const montserrat = Montserrat({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
