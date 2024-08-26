"use client";
import styles from "@/app/css-modules/BookAppointmentModal.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { IService } from "@/interfaces/service.interface";
import { useEffect } from "react";
import { LuSave } from "react-icons/lu";
import { IoTrashBinOutline } from "react-icons/io5";

interface formInputs {
  name: string | undefined;
  price: number | undefined;
  description: string | undefined;
}

interface props {
  serviceData: IService | undefined;
  closeModalF: () => void;
  onDeleteService: (serviceID: string | undefined) => void;
  onEditService: (editedService: {
    id: string | undefined;
    name: string | undefined;
    description: string | undefined;
    price: number | undefined;
  }) => void;
}

const EditServiceModal: React.FC<props> = ({
  closeModalF,
  onEditService,
  onDeleteService,
  serviceData,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createServiceSchema),
  });

  useEffect(() => {
    setValue("name", serviceData?.name);
    setValue("price", serviceData?.price);
    setValue("description", serviceData?.description);
    return;
  }, [serviceData]);

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

  const editService = (formData: formInputs) => {
    if (formData) {
      const data = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        id: serviceData?._id,
      };
      onEditService(data);
    }
  };

  const handleDeleteService = () => {
    onDeleteService(serviceData?._id);
  };

  return (
    <>
      <div
        className="absolute flex items-center justify-center modalCont "
        style={{ top: "64px" }}
      >
        <div
          className="flex flex-col text-black bg-white w-80 md:w-96 p-7 h-fit borderShadow"
          style={{ transform: "translateY(-32px)" }}
        >
          <IoMdClose
            className={styles.closeModal}
            onClick={() => closeModal("CLOSE")}
            size={22}
          />
          <h4 className="mb-6 text-xl font-bold text-center uppercase ">
            Editar servicio
          </h4>

          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col w-full gap-4 h-fit">
            <form
              onSubmit={handleSubmit((formData) => {
                editService(formData);
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

          <div className="flex justify-center w-full gap-2 align-middle mt-7 h-fit">
            <button
              onClick={handleDeleteService}
              className={styles.buttonRed}
            >
              <IoTrashBinOutline size={18} />
              Eliminar
            </button>
            <button onClick={handleSubmitClick} className={styles.button}>
              <LuSave size={18} />
              Guardar
            </button>
          </div>
        </div>
      </div>
      div
    </>
  );
};

export default EditServiceModal;
