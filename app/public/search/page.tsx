"use client";
import { HiSearch } from "react-icons/hi";
import Image from "next/image";
import { ChangeEventHandler, useState } from "react";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import AlertInterface from "@/interfaces/alert.interface";
import { GrTableAdd } from "react-icons/gr";
import { useRouter } from "next/navigation";
import stylesLogin from "@/app/css-modules/login.module.css";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import HeaderPublic from "@/components/HeaderPublic";

const SearchBusiness: React.FC = () => {
  const [searchField, setSearchField] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IBusiness[]>([]);
  const [alert, setAlert] = useState<AlertInterface>();
  const [loading, setLoading] = useState<boolean>(false);
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
      <HeaderPublic />
      <div className="flex flex-col items-center w-full pt-24 text-white h-fit">
        <div className={`${stylesLogin.loginCont2}`}>
          <header className="flex justify-center w-full mb-5 md:mb-10 h-fit">
            <h4 style={{ fontSize: "22px" }} className="font-bold uppercase ">
              Reservar turno
            </h4>
          </header>

          <div className="w-80">
            <div className={stylesLogin.loginFormInput}>
              <span className="text-xs font-semibold uppercase">
                Nombre de la empresa
              </span>
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
            {!loading && (
              <button
                onClick={handleSearch}
                className={`${stylesLogin.translucentBtn2}`}
              >
                <HiSearch size={18} />
                Buscar
              </button>
            )}
            {loading && (
              <>
                <div
                  style={{ height: "100%", width: "100%" }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="loaderSmall" style={{border: "2px solid white"}}></div>
                </div>
              </>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="flex justify-center w-full mt-6 h-fit">
              <div className="flex flex-col w-full gap-4 px-2 h-fit">
                {searchResults.map((business) => (
                  <>
                    <div
                      key={business._id}
                      style={{ border: "1px solid rgba(255, 255, 255, 0.12)" }}
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
                        <span className="text-sm font-medium">
                          {business.name}
                        </span>
                        <span className="text-xs font-light text-gray-300">
                          {business.businessType}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          router.push(`/${business.slug}`);
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
