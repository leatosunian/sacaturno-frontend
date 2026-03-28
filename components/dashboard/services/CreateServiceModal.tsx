"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface formInputs {
  name: string;
  price: number;
  description: string;
  duration?: number;
}

interface props {
  onCreateService: (formData: formInputs) => void;
}

const CreateServiceModal: React.FC<props> = ({ onCreateService }) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createServiceSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [priceDisplay, setPriceDisplay] = useState<string>("");


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
            className="flex flex-col justify-between w-full gap-5"
          >
            <div className="flex flex-col gap-2 w-full h-fit">
              <label className="text-xs font-bold uppercase">Nombre</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-orange-500"
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
            <div className="flex flex-col gap-2 w-full h-fit">
              <label className="text-xs font-bold uppercase">Precio</label>
              <div className="flex items-center w-full gap-2 h-fit">
                <span className="font-semibold text-md">AR$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:border-orange-500"
                  placeholder="Precio del servicio"
                  value={priceDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const numeric = raw ? parseInt(raw, 10) : 0;
                    setPriceDisplay(raw ? numeric.toLocaleString("es-AR") : "");
                    setValue("price", numeric, { shouldValidate: true });
                  }}
                />
              </div>
              {errors.price?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.price?.message}{" "}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full h-fit">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold uppercase">Descripción/observaciones</label>
                <span className="text-xs text-gray-500 ">(opcional)</span>
              </div>
              <textarea
                placeholder="Descripción del servicio"
                className="w-full px-3 py-2 text-sm border min-h-20 border-gray-300 rounded-md outline-none focus:border-orange-500"
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
            <div className="flex flex-col gap-2 w-full h-fit">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold uppercase">Duración</label>
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
