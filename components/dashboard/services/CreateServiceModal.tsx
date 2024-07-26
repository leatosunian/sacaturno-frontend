"use client";
import styles from "@/app/css-modules/BookAppointmentModal.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { useState } from "react";

interface formInputs {
  name: string;
  price: number;
  description: string;
}

interface props {
  closeModalF: () => void;
  onCreateService: (formData: formInputs) => void;
}

const CreateServiceModal: React.FC<props> = ({
  closeModalF,
  onCreateService,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createServiceSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);

  const closeModal = (action: string) => {
    closeModalF();
  };

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
      <div
        className="absolute flex items-center justify-center modalCont "
        style={{ top: "64px" }}
      >
        <div className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          <IoMdClose
            className={styles.closeModal}
            onClick={() => closeModal("CLOSE")}
            size={22}
          />
          <h4 className="mb-6 text-xl font-bold text-center uppercase ">
            Nuevo servicio
          </h4>

          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col w-full gap-4 h-fit">
            <form
              onSubmit={handleSubmit((formData) => {
                createService(formData);
              })}
              className="flex flex-col justify-between w-full gap-4 "
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
                    Descripción
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

          <div className="flex justify-center w-full align-middle mt-7 h-fit">
            {!loading && (
              <button className={styles.button} onClick={handleSubmitClick}>
                Crear servicio
              </button>
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
        </div>
      </div>
      div
    </>
  );
};

export default CreateServiceModal;
