"use client";
import Image from "next/image";
import { ChangeEventHandler, useState } from "react";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import AlertInterface from "@/interfaces/alert.interface";
import { GrTableAdd } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { IoIosSearch } from "react-icons/io";
import HeaderPublicBlack from "@/components/home/HeaderPublic";
import Footer from "@/components/home/Footer";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import styles from "@/app/css-modules/AuthCentered.module.css";

const SearchBusiness: React.FC = () => {
  const [searchField, setSearchField] = useState<string>("");
  const [searchResults, setSearchResults] = useState<IBusiness[]>([]);
  const [alert, setAlert] = useState<AlertInterface>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCalBtn, setLoadingCalBtn] = useState<boolean>(false);

  const router = useRouter();

  const myLoader = ({ src }: { src: string }) => {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${src}`;
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
      } catch (error: any) {
        console.log(error);
        setLoading(false);
      }
    }
  };

  return (
    <>
      <HeaderPublicBlack />
      <main className={styles.authBg}>
        <div className="relative z-[2] flex flex-col items-center gap-[18px] max-[1535px]:gap-3 w-full max-w-[460px]">

          <span className="inline-flex items-center gap-[7px] px-[13px] max-[1535px]:px-[11px] py-[5px] max-[1535px]:py-1 rounded-[20px] bg-[#fff1e8] text-[#dd4924] text-[10.5px] max-[1535px]:text-[9.5px] font-semibold tracking-[0.7px] uppercase">
            <IoIosSearch size={12} />
            SacaTurno
          </span>

          <h1 className="m-0 text-[38px] max-[1535px]:text-[30px] font-bold tracking-[-1.4px] max-[1535px]:tracking-[-1px] text-[#1a1a1a] text-center leading-[1.05]">
            Encontrá tu turno.
          </h1>
          <p className="-mt-1 max-[1535px]:-mt-0.5 text-[14px] max-[1535px]:text-[13px] text-[#7a7a7a] text-center max-w-[400px] leading-[1.55]">
            Buscá el negocio al que querés sacar turno y reservá en segundos.
          </p>

          <div className="w-full bg-white rounded-[15px] shadow-[-10px_10px_25px_1px_rgba(0,0,0,0.12)] border border-black/[0.06] overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-[#dd4924] to-[#ff8a5c]" />

            <div className="pt-5 max-[1535px]:pt-[14px] px-7 max-[1535px]:px-[22px] pb-7 max-[1535px]:pb-[22px] flex flex-col gap-5 max-[1535px]:gap-[14px]">

              <div className="w-full flex flex-col gap-0.5">
                <span className="text-[12px] font-medium uppercase">
                  Nombre de la empresa
                </span>
                <input
                  value={searchField}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Ingresá el nombre de la empresa"
                  type="text"
                  maxLength={30}
                  className="h-[30px] max-[1535px]:h-[26px] w-full border border-black/10 rounded-[7px] bg-black/5 text-[13px] max-[1535px]:text-[11px] px-2.5 transition-all ease-in-out duration-200 cursor-pointer hover:border-[#dd4924] focus:bg-black/[0.08] focus:border-[#dd4924] focus:outline-none"
                />
                {alert?.error && (
                  <div className="flex items-center gap-1 mt-1 w-fit h-fit">
                    <AiOutlineExclamationCircle color="red" />
                    <span className="text-xs">{alert.msg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center w-full h-fit">
                {loading ? (
                  <div className="flex items-center justify-center w-full" style={{ padding: "11px 0" }}>
                    <div className="loaderSmall"></div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSearch}
                    className={`${stylesHome.btnAnimated} rounded-lg`}
                    style={{ fontSize: "13px", letterSpacing: ".5px", width: "100%", padding: "11px 0px" }}
                  >
                    Buscar
                  </button>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-black/[0.06] pt-5">
                  {searchResults.map((business) => (
                    <div
                      key={business._id}
                      className="flex items-center gap-3 px-3 py-3 rounded-[10px] border border-black/[0.07] bg-black/[0.02] hover:border-[#dd4924] transition-all duration-200 ease-in-out"
                    >
                      <Image
                        loader={myLoader}
                        width={44}
                        height={44}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${business.image}`}
                        alt={`Logo de ${business.name}`}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[13px] font-semibold text-[#1a1a1a] truncate">
                          {business.name}
                        </span>
                        <span className="text-[11px] text-[#7a7a7a]">
                          {business.businessType}
                        </span>
                      </div>
                      <div className="flex-shrink-0">
                        {loadingCalBtn ? (
                          <div className="flex items-center justify-center w-9 h-9">
                            <div className="loaderSmall"></div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setLoadingCalBtn(true);
                              router.push(`/${business.slug}`);
                            }}
                            title="Ver turnos"
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#dd4924] hover:bg-[#d92f04] text-white transition-all duration-200 ease-in-out cursor-pointer"
                          >
                            <GrTableAdd size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default SearchBusiness;
