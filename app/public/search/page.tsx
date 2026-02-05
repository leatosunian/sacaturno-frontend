"use client";
import Image from "next/image";
import { ChangeEventHandler, useState } from "react";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import AlertInterface from "@/interfaces/alert.interface";
import { GrTableAdd } from "react-icons/gr";
import { useRouter } from "next/navigation";
import sacaturno_logo from "@/public/st_logo_white.png";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import stylesLogin from "@/app/css-modules/login.module.css";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";
import { IoIosSearch } from "react-icons/io";
import Link from "next/link";
import Footer from "@/components/home/Footer";

const SearchBusiness: React.FC = () => {
  const [searchField, setSearchField] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IBusiness[]>([]);
  const [alert, setAlert] = useState<AlertInterface>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCalBtn, setLoadingCalBtn] = useState<boolean>(false);

  const router = useRouter();

  const myLoader = ({ src }: { src: string }) => {
    return `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${src}`;
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
      <HeaderPublicBlack />
      <div
        style={{
          height: "calc(100vh - 64px)",
          paddingTop: "0px",
          marginBottom: "64px",
        }}
      >
        <div className="flex flex-col w-full h-screen lg:flex-row">
          <div
            className={`flex-col items-center justify-center hidden w-full pt-0 md:pt-0 md:pb-0 lg:flex pb-14 h-2 lg:h-full lg:w-2/5 ${stylesLogin.backgroundImage}`}
          >
            <Image
              className="w-48 lg:mt-0 lg:w-96"
              alt=""
              src={sacaturno_logo}
            />
            <span className="mt-2 text-sm font-thin text-gray-200 lg:mt-0 lg:text-lg">
              tu app para gestionar tu agenda
            </span>
            <div className="hidden mt-10 lg:block">
              <Link
                href="/public/search"
                type="submit"
                className={`${stylesLogin.translucentBtn2} font-light uppercase`}
                style={{ padding: " 12px 16px ", fontSize: "13px" }}
              >
                <IoIosSearch size={24} />
                Buscar empresa
              </Link>
            </div>
          </div>
          <div
            className={`flex justify-center w-full my-auto md:my-0 pt-10 md:pt-24 items-start md:items-center lg:pt-0 lg:mt-0 h-full lg:w-3/5 ${stylesHome.dottedBg}`}
          >
            <div className={`${stylesLogin.loginCont}`}>
              <div className={stylesLogin.loginHeader}>
                <h3
                  className="relative inline-block mb-3 text-2xl font-semibold uppercase xl:text-3xl px-auto"

                >
                  Reservar turno
                  <span
                    className="absolute left-0 mx-auto"
                    style={{
                      bottom: 0,    // gap entre texto y linea (ajustalo)
                      height: 2,     // grosor de la linea (ajustalo)
                      background: "#dd4924",
                      width: "40%",  // ancho opcional de la linea
                    }}
                  />
                </h3>
                <span className="text-xs text-left text-gray-500 lg:text-sm">
                  Ingresá el nombre de la empresa que estás buscando
                </span>
              </div>

              <div className="w-full">
                <div className={stylesLogin.loginFormInput}>
                  <span className="text-xs font-semibold uppercase">
                    Nombre de la empresa
                  </span>
                  <input
                    value={searchField}
                    onChange={handleChange}
                    placeholder="Ingresá el nombre de la empresa"
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
              <div className="flex flex-col w-full gap-4 mt-7 md:flex-row">
                {!loading && (
                  <button
                    type="submit"
                    className={`${stylesHome.btnAnimated} rounded-lg`}
                    onClick={handleSearch}
                    style={{
                      fontSize: "13px",
                      letterSpacing: ".5px",
                      width: "100%",
                      padding: "11px 0",
                    }}
                  >
                    Buscar
                  </button>
                )}
                {loading && (
                  <>
                    <div
                      style={{
                        height: "100%",
                        width: "100%",
                        padding: "11px 0",
                      }}
                      className="flex items-center justify-center w-full h-11"
                    >
                      <div className="loaderSmall"></div>
                    </div>
                  </>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="flex justify-center w-full mt-8 h-fit">
                  <div className="flex flex-col w-full gap-4 h-fit">
                    {searchResults.map((business) => (
                      <>
                        <div
                          key={business._id}
                          style={{
                            border: "1px solid rgba(0, 0, 0, 0.15)",
                          }}
                          className="flex items-center w-full gap-4 px-4 h-14 backdrop-blur py-9 rounded-xl"
                        >
                          <Image
                            loader={myLoader}
                            width={64}
                            height={64}
                            className="w-12 h-12 rounded-full"
                            src={`https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${business.image}`}
                            alt=""
                          />
                          <div className="flex flex-col w-fit h-fit">
                            <span className="text-sm font-medium">
                              {business.name}
                            </span>
                            <span className="text-xs font-light text-gray-500">
                              {business.businessType}
                            </span>
                          </div>
                          {/* <button
                            onClick={() => {
                              router.push(`/${business.slug}`);
                            }}
                            title="Ver turnos"
                            className={`ml-auto ${stylesLogin.buttonBusiness}`}
                            style={{ padding: "25px 0 !important" }}
                          >
                            <GrTableAdd className="my-1" size={15} />
                          </button> */}

                          <div className="flex items-center justify-center ml-auto w-fit h-fit">
                            {loadingCalBtn && (
                              <>
                                <div
                                  style={{ height: "35px", width: "41px" }}
                                  className="flex items-center justify-center w-full"
                                >
                                  <div className="loaderSmall"></div>
                                </div>
                              </>
                            )}
                            {!loadingCalBtn && (
                              <button
                                onClick={() => {
                                  setLoadingCalBtn(true)
                                  router.push(`/${business.slug}`);
                                }}
                                title="Ver turnos"
                                className={`ml-auto ${stylesLogin.buttonBusiness}`}
                                style={{ padding: "25px 0 !important" }}
                              >
                                <GrTableAdd className="my-1" size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SearchBusiness;
