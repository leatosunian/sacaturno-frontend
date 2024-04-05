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
import stylesLogin from "@/app/css-modules/login.module.css";
import { AiOutlineExclamationCircle } from "react-icons/ai";

const SearchBusiness: React.FC = () => {
  const [searchField, setSearchField] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IBusiness[]>([]);
  const [alert, setAlert] = useState<AlertInterface>();
  const router = useRouter();

  const myLoader = ({ src }: { src: string }) => {
    return `${process.env.BACKEND_URL}/api${src}`;
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
    if (searchField !== "") {
      try {
        const res = await axiosReq.get(`/business/search/${searchField}`, {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
        console.log(res.data);
        if (res.data === "BUSINESS_NOT_FOUND") {
          setAlert({
            msg: "No se encontraron resultados",
            error: true,
            alertType: "ERROR_ALERT",
          });
          hideAlert();
          return;
        }
        if (res.data instanceof Array) {
          return setSearchResults(res.data);
        }

        /*return res.data;*/
      } catch (error: any) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full mt-10 text-white h-fit">
        <div className={`${stylesLogin.loginCont2}`}>
          <header className="flex justify-center w-full mb-5 md:mb-10 h-fit">
            <h4 className="text-2xl font-semibold text-white md:text-3xl">
              Reservar turno
            </h4>
          </header>

          <div className="w-80">
            <div className={stylesLogin.loginFormInput}>
              <span className="text-sm font-normal">Nombre de la empresa</span>
              <input
                value={searchField}
                onChange={handleChange}
                type="text"
                maxLength={30}
              />
            </div>
            {/* ALERT */}
            {alert?.error && (
              <>
                <div className="flex items-center justify-center gap-1 mt-3 w-fit h-fit">
                  <AiOutlineExclamationCircle color="red" />
                  <span className="text-xs "> {alert.msg} </span>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4 mt-5 md:flex-row">
            <button
              onClick={handleSearch}
              className={`${stylesLogin.translucentBtn2}`}
            >
              <HiSearch size={18} />
              Buscar
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="flex justify-center w-full mt-10 h-fit">
              <div className="h-14 w-80 ">
                {searchResults.map((business) => (
                  <>
                    <div
                      key={business._id}
                      style={{ border: "1px solid rgba(255, 255, 255, 0.12)" }}
                      className="flex items-center w-full h-full gap-4 px-5 text-white backdrop-blur py-9 rounded-xl"
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
                        <span className="text-sm font-medium">
                          {business.name}
                        </span>
                        <span className="text-xs font-light text-gray-300">
                          {business.businessType}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          router.push(`/public/book/${business._id}`);
                        }}
                        title="Ver turnos"
                        className={`ml-auto ${stylesLogin.translucentBtn2}`}
                        style={{ padding: "25px 0 !important" }}
                      >
                        <GrTableAdd className="my-1" size={15} />
                      </button>
                    </div>
                  </>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBusiness;
