"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

const BackstageLogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/backstage/logout", { method: "POST" });
    router.push("/backstage/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-600 px-3 py-1.5 text-xs text-gray-300 transition-colors duration-200 hover:border-red-500 hover:text-red-500"
    >
      <LogOut size={13} />
      Salir
    </button>
  );
};

export default BackstageLogoutButton;
