import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import UserDetailPanel from "@/components/backstage/UserDetailPanel";

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000/api";

async function fetchUserDetail(userId: string) {
  const token = cookies().get("sacaturno_hq_token")?.value;
  const res = await fetch(`${backendUrl}/superadmin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BackstageUserDetailPage({ params }: { params: { userId: string } }) {
  const data = await fetchUserDetail(params.userId);
  if (!data) return notFound();

  return <UserDetailPanel data={data} />;
}
