import type { Metadata } from "next";
import { cookies } from "next/headers";
import AdminHeader from "@/components/dashboard/AdminHeader";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import AdminBreadcrumbs from "@/components/dashboard/AdminBreadcrumbs";
import { getTokenPayload } from "@/lib/getTokenPayload";
import { PermissionsProvider } from "@/components/dashboard/PermissionsProvider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AdminRouteChangeLoader from "@/components/ui/AdminRouteChangeLoader";
import { PLAN_SHORT_LABELS, SubscriptionType } from "@/lib/planLimits";

export const metadata: Metadata = {
  title: "Panel de administración",
  description:
    "Gestioná tus turnos, tu empresa y tu agenda desde tu panel de administración en SacaTurno.",
  robots: { index: false, follow: false },
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token")?.value;
  const payload = getTokenPayload();
  const role = (payload?.role ?? null) as "owner" | "employee" | null;

  let permissions: string[] = payload?.permissions ?? [];
  if (role === "employee" && token) {
    try {
      const res = await fetch(`${process.env.BACKEND_URL}/employee/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const emp = await res.json();
        permissions = emp.permissions ?? [];
      }
    } catch {}
  }

  let userName = "";
  let userEmail = "";
  let userAvatar = "";
  if (payload?.userId && token) {
    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/user/get/${payload.userId}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
      );
      if (res.ok) {
        const { response_data } = await res.json();
        userName = [response_data.name, response_data.surname]
          .filter(Boolean)
          .join(" ");
        userEmail = response_data.email ?? "";
        const pic = response_data.profileImage;
        if (pic && pic !== "user.png") {
          userAvatar = `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${pic}`;
        }
      }
    } catch {}
  }

  let subscriptionPlan: string | undefined;
  let subscriptionType: SubscriptionType | undefined;
  if (role === "owner" && payload?.userId && token) {
    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/subscription/get/ownerID/${payload.userId}`,
        { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
      );
      if (res.ok) {
        const data = await res.json();
        const type: SubscriptionType =
          data?.subscriptionType ?? "SC_FREE";
        subscriptionType = type;
        subscriptionPlan = PLAN_SHORT_LABELS[type] ?? PLAN_SHORT_LABELS.SC_FREE;
      }
    } catch {}
    subscriptionPlan ??= PLAN_SHORT_LABELS.SC_FREE;
    subscriptionType ??= "SC_FREE";
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "240px" } as React.CSSProperties}
    >
      {/* Sidebar — shadcn maneja visibilidad: desktop=fixed, mobile=Sheet cerrado */}
      <AdminSidebar
        role={role}
        permissions={permissions}
        userName={userName}
        userEmail={userEmail}
        userAvatar={userAvatar}
        subscriptionPlan={subscriptionPlan}
        subscriptionType={subscriptionType}
      />

      {/* Main content area */}
      <SidebarInset className="min-h-screen">
        <AdminRouteChangeLoader />
        {/* Navbar — mobile only (el sidebar ya se oculta en mobile internamente) */}
        <div className="md:hidden">
          <AdminHeader role={role} permissions={permissions} subscriptionType={subscriptionType} />
        </div>

        <PermissionsProvider permissions={permissions}>
          {/* Breadcrumbs — desktop only, above page title */}
          <div className="hidden md:block w-full px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto pt-6 pb-0">
            <AdminBreadcrumbs />
          </div>
          {children}
        </PermissionsProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
