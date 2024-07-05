import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/authContext";

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
      </body>
    </html>
  );
}
