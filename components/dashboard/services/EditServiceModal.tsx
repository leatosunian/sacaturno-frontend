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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface formInputs {
  name: string | undefined;
  price: number | undefined;
  description: string | undefined;
  duration?: number | undefined;
}

interface props {
  serviceData: IService | undefined;
  onDeleteService: (serviceID: string | undefined) => void;
  onEditService: (editedService: {
    id: string | undefined;
    name: string | undefined;
    description: string | undefined;
    price: number | undefined;
    duration?: number | undefined;
  }) => void;
}

const EditServiceModal: React.FC<props> = ({
  onEditService,
  onDeleteService,
  serviceData,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createServiceSchema),
  });

  useEffect(() => {
    setValue("name", serviceData?.name);
    setValue("price", serviceData?.price);
    setValue("description", serviceData?.description);
    setValue("duration", serviceData?.duration);
  }, [serviceData, setValue]);


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
        duration: formData.duration,
      };
      onEditService(data);
    }
  };

  const handleDeleteService = () => {
    onDeleteService(serviceData?._id);
  };

  return (
    <>
      <div className="flex flex-col items-center w-full gap-7 h-fit">


        <h4
          className="relative inline-block px-2 mx-auto text-xl font-bold text-center uppercase w-fit"
          style={{ fontSize: 22 }}
        >
          Editar servicio
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
            <div className={styles.formInput}>
              <div className="flex items-center gap-1">
                <span
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Duración
                </span>
                <span className="text-xs text-gray-500 ">(opcional)</span>
              </div>
              <Select
                value={watch("duration") ? String(watch("duration")) : ""}
                onValueChange={(value) =>
                  setValue("duration", value ? Number(value) : undefined)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar duración" />
                </SelectTrigger>
                <SelectContent>
                  {[30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240].map(
                    (minutes) => {
                      const hours = Math.floor(minutes / 60)
                      const mins = minutes % 60
                      const formatDuration = () => {
                        if (hours === 0) {
                          return `${minutes} minutos`
                        } else if (mins === 0) {
                          return `${hours} hora${hours > 1 ? 's' : ''}`
                        } else {
                          return `${hours}:${mins.toString().padStart(2, '0')} horas`
                        }
                      }
                      return (
                        <SelectItem key={minutes} value={String(minutes)}>
                          {formatDuration()}
                        </SelectItem>
                      )
                    }
                  )}
                </SelectContent>
              </Select>
              {errors.duration?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.duration?.message}{" "}
                </span>
              )}
            </div>
            <button
              onClick={handleSubmitClick}
              className={"inputSubmitField hidden "}
            />
          </form>
        </div>

        <div className="flex justify-center w-full gap-5 align-middle h-fit">

          <Button
            className="w-full text-white bg-red-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-red-700 "
            onClick={handleDeleteService}>
            <IoTrashBinOutline size={18} />
            Eliminar
          </Button>


          <Button
            className="w-full text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700 "
            onClick={handleSubmitClick}>
            <LuSave size={18} />
            Guardar
          </Button>
        </div>

      </div >
    </>
  );
};

export default EditServiceModal;
