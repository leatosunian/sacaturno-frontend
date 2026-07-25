import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBackstageTokenPayload } from "@/lib/getBackstageTokenPayload";
import BackstageLogoutButton from "@/components/backstage/BackstageLogoutButton";
import sacaturno_logo from "@/public/sacaturno-orange.svg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Backstage",
  robots: { index: false, follow: false },
};

export default function BackstageProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const payload = getBackstageTokenPayload();
  if (!payload) {
    redirect("/backstage/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <header className="border-b border-black/10 bg-black">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-8 2xl:px-14">
          <nav className="flex items-center gap-6">
            <Image src={sacaturno_logo} alt="Sacaturno" className="h-6 w-auto" />
            <Link href="/backstage" className="text-xs text-gray-300 transition-colors hover:text-orange-500">
              Resumen
            </Link>
            <Link href="/backstage/businesses" className="text-xs text-gray-300 transition-colors hover:text-orange-500">
              Negocios
            </Link>
            <Link href="/backstage/users" className="text-xs text-gray-300 transition-colors hover:text-orange-500">
              Usuarios
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                {payload.email[0].toUpperCase()}
              </div>
              <span className="text-xs text-gray-400">{payload.email}</span>
            </div>
            <BackstageLogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 2xl:px-14">{children}</main>
    </div>
  );
}
