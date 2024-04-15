import { Metadata, NextPage } from "next";
import styles from "../../css-modules/miempresa.module.css";
import FormMiEmpresa from "@/components/FormMiEmpresa";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { cookies } from "next/headers";
import Image from "next/image";
import BusinessSkImg from "@/public/business.png";
import Link from "next/link";

interface Props {}
export const metadata: Metadata = {
  title: "Mi Empresa - SacaTurno",
  description: "IT-related blog for devs",
};

async function getBusinessData() {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const ownerID = cookieStore.get("sacaturno_userID");
  try {
    const res = await axiosReq.get(`/business/get/${ownerID?.value}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
        "Cache-Control": "no-store",
      },
    });
    return res.data;
  } catch (error: any) {
    const response_data = {
      businessExists: false,
      name: "",
      businessType: "",
      address: "",
      appointmentDuration: "",
      dayStart: "",
      dayEnd: "",
    };
    return { response_data };
  }
}

const MiEmpresa: NextPage<Props> = async ({}) => {
  const data: IBusiness = await getBusinessData();

  return (
    <>
      <header className="flex justify-center w-full mt-5 mb-5 md:mt-7 md:mb-7 h-fit">
        <h4 style={{fontSize:'22px'}} className="font-bold uppercase ">Mi Empresa</h4>
      </header>
      <div className="flex justify-center w-screen mt-5 h-fit">
        {typeof data !== "string" && (
          <div className={styles.cont}>
            <FormMiEmpresa businessData={data} />
          </div>
        )}

        {typeof data === "string" && (
          <div className="flex h-full w-fit backdrop-blur-sm ">
            <Image
              className="rounded-xl"
              alt=""
              src={BusinessSkImg}
              width={800}
              height={800}
            />
            <div
              className="absolute flex flex-col items-center justify-center w-full h-full gap-5 bg-opacity-20 backdrop-blur-sm rounded-xl"
              style={{
                boxShadow: "-10px 10px 25px 1px rgba(0,0,0,0.22)",
                WebkitBoxShadow: "7px 10px 25px 1px rgba(0,0,0,0.22)",
                MozBoxShadow: "7px 10px 25px 1px rgba(0,0,0,0.22)",
                backgroundColor: "rgb(0,0,0, 0.12)",
              }}
            >
              <h4 className="text-2xl font-semibold">
                No tenés una empresa creada.
              </h4>
              <Link href="/admin/miempresa/create">
                <button className={styles.button}>Crear empresa</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MiEmpresa;
