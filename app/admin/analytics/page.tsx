import AnalyticsComponent from "@/components/dashboard/AnalyticsComponent";
import axiosReq from "@/config/axios";
import { cookies } from "next/headers";

async function getBusinessId(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  try {
    const res = await axiosReq.get(`/business/get/${ownerID?.value}`, {
      headers: { Authorization: `Bearer ${token?.value}` },
    });
    return res.data._id ?? null;
  } catch {
    return null;
  }
}

const AnalyticsPage: React.FC = async () => {
  const businessId = await getBusinessId();
  return <AnalyticsComponent businessId={businessId} />;
};

export default AnalyticsPage;
