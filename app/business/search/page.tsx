"use client";
import styles from "@/app/css-modules/miempresa.module.css";
import { HiSearch } from "react-icons/hi";
import Image from "next/image";
import { ChangeEventHandler, useState } from "react";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import { GrTableAdd } from "react-icons/gr";
import { useRouter } from "next/navigation";

const SearchBusiness: React.FC = () => {
  const [searchField, setSearchField] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<IBusiness[]>([]);
  const [alert, setAlert] = useState<AlertInterface>();
  const router = useRouter();

  const myLoader = ({ src }: { src: string }) => {
    return `https://sacaturno-server-production.up.railway.app/api${src}`;
  };

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();
    setSearchField(e.target.value);
  };

  const handleSearch = async () => {
    setSearchResults([]);
    if (searchField !== "") {
      setLoading(true);
      try {
        const res = await axiosReq.get(`/business/search/${searchField}`, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
        if (res.data === "BUSINESS_NOT_FOUND") {
          setAlert({
            msg: "No se encontraron resultados",
            error: true,
            alertType: "ERROR_ALERT",
          });
          hideAlert();
          setLoading(false);
          return;
        }
        if (res.data instanceof Array) {
          setLoading(false);
          return setSearchResults(res.data);
        }

        /*return res.data;*/
      } catch (error: any) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <header className="flex justify-center w-full mt-8 mb-5 md:mt-7 md:mb-7 h-fit">
        <h4 style={{ fontSize: "22px" }} className="font-bold uppercase ">
          sacar turno
        </h4>
      </header>

      <div className="flex flex-col items-center w-full h-fit">
        <div className="w-80">
          <div className={styles.formInput}>
            <span className="text-xs font-bold uppercase">
              Nombre de la empresa
            </span>
            <input
              value={searchField}
              onChange={handleChange}
              type="text"
              maxLength={30}
            />
          </div>
        </div>
        <div className="flex flex-col gap-4 mt-5 md:flex-row">
          {!loading && (
            <button onClick={handleSearch} className={styles.button}>
              <HiSearch size={18} />
              Buscar
            </button>
          )}
          {loading && (
            <>
              <div
                style={{ height: "100%", width: "100%" }}
                className="flex items-center justify-center w-full bg-white"
              >
                <div className="loaderSmall"></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center w-full mt-6 h-fit">
        <div className="flex flex-col gap-4 w-80 h-fit">
          {searchResults.map((business) => (
            <>
              <div
                key={business._id}
                style={{ border: "1px solid rgba(95, 95, 95, 0.267)" }}
                className="flex items-center w-full gap-4 px-5 text-white h-14 backdrop-blur py-9 rounded-xl"
              >
                <Image
                  loader={myLoader}
                  width={64}
                  height={64}
                  className="w-12 h-12 rounded-full"
                  src={`/user/getprofilepic/${business.image}`}
                  alt=""
                />
                <div className="flex flex-col w-fit h-fit">
                  <span className="text-sm font-semibold text-black">
                    {business.name}
                  </span>
                  <span className="text-xs font-light text-gray-500">
                    {business.businessType}
                  </span>
                </div>
                <button
                  onClick={() => {
                    router.push(`/business/book/${business._id}`);
                  }}
                  title="Ver turnos"
                  className={`ml-auto ${styles.button}`}
                  style={{ padding: "25px 0 !important" }}
                >
                  <GrTableAdd className="my-1" size={15} />
                </button>
              </div>
            </>
          ))}
        </div>
      </div>

      {/* ALERT */}
      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert
            error={alert?.error}
            msg={alert?.msg}
            alertType={alert?.alertType}
          />
        </div>
      )}
    </>
  );
};

export default SearchBusiness;
