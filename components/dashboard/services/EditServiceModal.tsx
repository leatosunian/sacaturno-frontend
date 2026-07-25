"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useRef, useState } from "react";
import { LuSave } from "react-icons/lu";
import { IoTrashBinOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface formInputs {
  name: string | undefined;
  price: number | undefined;
  description: string | undefined;
  duration?: number | undefined;
  depositAmount?: number | undefined;
}

interface props {
  mpLinked?: boolean;
  serviceData: IService | undefined;
  onDeleteService: (serviceID: string | undefined) => void;
  onEditService: (editedService: {
    id: string | undefined;
    name: string | undefined;
    description: string | undefined;
    price: number | undefined;
    duration?: number | undefined;
    depositAmount?: number | undefined;
  }) => void;
}

const inputClass = "h-9 w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100 placeholder:text-gray-400";
const labelClass = "text-xs font-medium text-gray-600";
const errorClass = "text-xs text-red-500 mt-0.5";

const EditServiceModal: React.FC<props> = ({ mpLinked, onEditService, onDeleteService, serviceData }) => {
  const {
    register, handleSubmit, setValue, reset,
    formState: { errors, isDirty },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    reset({
      name: serviceData?.name,
      price: serviceData?.price,
      description: serviceData?.description,
      duration: serviceData?.duration,
      depositAmount: serviceData?.depositAmount ?? 0,
    });
    setPriceDisplay(serviceData?.price ? serviceData.price.toLocaleString("es-AR") : "");
    setDepositDisplay(
      serviceData?.depositAmount ? serviceData.depositAmount.toLocaleString("es-AR") : ""
    );
    setTimeout(() => {
      if (descRef.current) {
        descRef.current.style.height = "auto";
        descRef.current.style.height = descRef.current.scrollHeight + "px";
      }
    }, 0);
  }, [serviceData, reset]);

  const { ref: descRegisterRef, ...descRegister } = register("description");

  const handleSubmitClick = () => {
    (document.querySelector(".inputSubmitField") as HTMLElement)?.click();
  };

  const editService = (formData: formInputs) => {
    onEditService({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      id: serviceData?._id,
      duration: formData.duration,
      depositAmount: formData.depositAmount ?? 0,
    });
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
        <h4 className="text-lg leading-none font-semibold text-gray-800">Editar servicio</h4>
      </div>

      <form onSubmit={handleSubmit(editService)} className="flex flex-col w-full gap-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Nombre</label>
          <input
            type="text"
            maxLength={30}
            className={inputClass}
            {...register("name")}
          />
          {errors.name?.message && <span className={errorClass}>{errors.name.message}</span>}
        </div>

        {/* Precio + Seña */}
        <div className={`grid gap-4 ${mpLinked ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Precio</label>
            <div className="flex items-center h-9 rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 transition-all duration-200 ease-in-out hover:border-orange-600 focus-within:border-orange-600 focus-within:bg-gray-100">
              <span className="text-sm text-gray-400 mr-1.5">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                placeholder="0"
                value={priceDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                  setPriceDisplay(raw ? Number(raw).toLocaleString("es-AR") : "");
                  setValue("price", raw ? Number(raw) : 0, { shouldDirty: true });
                }}
              />
            </div>
            {errors.price?.message && <span className={errorClass}>{errors.price.message}</span>}
          </div>

          {mpLinked && (
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Seña</label>
              <div className="flex items-center h-9 rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 transition-all duration-200 ease-in-out hover:border-orange-600 focus-within:border-orange-600 focus-within:bg-gray-100">
                <span className="text-sm text-gray-400 mr-1.5">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                  placeholder="0"
                  value={depositDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                    setDepositDisplay(raw ? Number(raw).toLocaleString("es-AR") : "");
                    setValue("depositAmount", raw ? Number(raw) : 0, { shouldDirty: true });
                  }}
                />
              </div>
              {errors.depositAmount?.message && (
                <span className={errorClass}>{errors.depositAmount.message}</span>
              )}
            </div>
          )}
        </div>

        {/* Duración */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Duración</label>
          <Select
            defaultValue={String(serviceData?.duration ?? 30)}
            onValueChange={(val) => setValue("duration", Number(val), { shouldDirty: true })}
          >
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-[rgb(235,235,235)] hover:border-orange-600 focus:ring-0 focus:border-orange-600 transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[15, 20, 30, 40, 45, 60, 75, 90, 120].map((minutes) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const label =
                  hours > 0
                    ? mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? "s" : ""}`
                    : `${mins} min`;
                return (
                  <SelectItem key={minutes} value={String(minutes)} className="text-sm">
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Descripción</label>
          <textarea
            className="w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 py-2 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100 resize-none overflow-hidden placeholder:text-gray-400"
            rows={2}
            maxLength={140}
            placeholder="Describí el servicio brevemente"
            ref={(el) => { descRegisterRef(el); descRef.current = el; }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            {...descRegister}
          />
          {errors.description?.message && (
            <span className={errorClass}>{errors.description.message}</span>
          )}
        </div>

        <button type="submit" className="inputSubmitField hidden" />
      </form>

      <div className="flex justify-center w-full mt-2 gap-3">
        <Button
          className="flex-1 h-11 text-white bg-red-600 hover:bg-red-700"
          onClick={() => onDeleteService(serviceData?._id)}
        >
          <IoTrashBinOutline size={18} /> Eliminar
        </Button>
        <Button
          disabled={!isDirty}
          className="flex-1 h-11 text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
          onClick={handleSubmitClick}
        >
          <LuSave size={18} /> Guardar
        </Button>
      </div>
    </div>
  );
};

export default EditServiceModal;
