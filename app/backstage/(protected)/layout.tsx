import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBackstageTokenPayload } from "@/lib/getBackstageTokenPayload";
import BackstageHeader from "@/components/backstage/BackstageHeader";

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
      <BackstageHeader email={payload.email} />
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-8 2xl:px-14">{children}</main>
    </div>
  );
}
