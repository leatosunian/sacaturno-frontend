import type { Metadata } from "next";
import BackstageLoginForm from "@/components/backstage/BackstageLoginForm";
import sacaturno_logo from "@/public/sacaturno-orange.svg";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Backstage",
  robots: { index: false, follow: false },
};

export default function BackstageLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d0d0d] p-8 shadow-2xl">
        <Image src={sacaturno_logo} alt="Sacaturno" className="mx-auto mb-6 h-10 w-auto" />
        <BackstageLoginForm />
      </div>
    </main>
  );
}
