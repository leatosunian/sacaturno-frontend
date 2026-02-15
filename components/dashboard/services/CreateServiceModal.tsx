"use client";
import styles from "@/app/css-modules/BookAppointmentModal.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface formInputs {
  name: string;
  price: number;
  description: string;
}

interface props {
  onCreateService: (formData: formInputs) => void;
}

const CreateServiceModal: React.FC<props> = ({ onCreateService }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createServiceSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);


  const handleSubmitClick = () => {
    const fileInput = document.querySelector(
      ".inputSubmitField"
    ) as HTMLElement;

    if (fileInput != null) {
      fileInput.click();
    }
  };

  const createService = async (formData: formInputs) => {
    setLoading(true);
    if (formData) {
      onCreateService(formData);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full gap-7 h-fit">
        <h4
          className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
          style={{ fontSize: 22 }}
        >
          Nuevo servicio
          {/* linea */}
          <span
            className="absolute left-0 right-0 mx-auto"
            style={{
              bottom: -2,    // gap entre texto y linea (ajustalo)
              height: 2,     // grosor de la linea (ajustalo)
              background: "#dd4924",
              width: "60%",  // ancho opcional de la linea
            }}
          />
        </h4>

        {/* <span>Hacé click en un turno para ver los detalles</span> */}
        <div className="flex flex-col w-full h-fit">
          <form
            onSubmit={handleSubmit((formData) => {
              createService(formData);
            })}
            className="flex flex-col justify-between w-full gap-5 "
          >
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase"
              >
                Nombre
              </span>
              <input
                type="text"
                className="placeholder:text-xs"
                maxLength={30}
                {...register("name")}
                placeholder="Nombre del servicio"
              />
              {errors.name?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.name.message}{" "}
                </span>
              )}
            </div>
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Precio
              </span>
              <div className="flex items-center w-full gap-2 h-fit">
                <span className="font-semibold text-md">AR$</span>
                <input
                  type="number"
                  maxLength={20}
                  className="placeholder:text-xs"
                  placeholder="Precio del servicio"
                  {...register("price")}
                />
              </div>
              {errors.price?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.price?.message}{" "}
                </span>
              )}
            </div>
            <div className={styles.formInput}>
              <div className="flex items-center gap-1">
                <span
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Descripción/observaciones
                </span>
                <span className="text-xs text-gray-500 ">(opcional)</span>
              </div>
              <textarea
                placeholder="Descripción del servicio"
                className="placeholder:text-xs"
                {...register("description")}
                maxLength={140}
              />
              {errors.description?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.description?.message}{" "}
                </span>
              )}
            </div>
            <button
              onClick={handleSubmitClick}
              className={"inputSubmitField hidden "}
            />
          </form>
        </div>

        <div className="flex justify-center w-full align-middle h-fit">
          {!loading && (


            <Button
              className="w-full text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700 "
              onClick={handleSubmitClick}
            >
              Agregar servicio
            </Button>

          )}
          {loading && (
            <>
              <div
                style={{ height: "100%", width: "100%" }}
                className="flex items-center justify-center w-full"
              >
                <div className="loaderSmall"></div>
              </div>
            </>
          )}
        </div>
      </div >

    </>
  );
};

export default CreateServiceModal;
