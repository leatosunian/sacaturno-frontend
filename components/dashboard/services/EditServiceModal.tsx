"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useRef, useState } from "react";
import { LuSave } from "react-icons/lu";
import { IoTrashBinOutline } from "react-icons/io5";
import { Input } from "@/components/ui/input";
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

const labelClass = "text-xs font-bold tracking-wider uppercase";
const errorClass = "text-xs text-red-500 mt-0.5";
const underlineInput = "px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0";

const EditServiceModal: React.FC<props> = ({ onEditService, onDeleteService, serviceData }) => {
  const {
    register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setValue("name", serviceData?.name);
    setValue("price", serviceData?.price);
    setValue("description", serviceData?.description);
    setValue("duration", serviceData?.duration);
    setValue("depositAmount", serviceData?.depositAmount ?? 0);
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
  }, [serviceData, setValue]);

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
    <div className="flex flex-col w-full gap-5">
      <h4 className="relative inline-block px-2 mx-auto text-xl font-bold text-center uppercase w-fit">
        Editar servicio
        <span
          className="absolute left-0 right-0 mx-auto"
          style={{ bottom: -2, height: 2, background: "#dd4924", width: "60%" }}
        />
      </h4>

      <form onSubmit={handleSubmit(editService)} className="flex flex-col w-full gap-4 pt-1">
        {/* Nombre */}
        <div className="flex flex-col">
          <label className={labelClass}>Nombre</label>
          <Input
            type="text"
            className={underlineInput}
            {...register("name")}
          />
          {errors.name?.message && <span className={errorClass}>{errors.name.message}</span>}
        </div>

        {/* Precio + Seña */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className={labelClass}>Precio</label>
            <div className="flex items-center border-b border-border">
              <span className="text-sm text-muted-foreground mr-1">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="flex-1 bg-transparent outline-none text-sm py-1 focus:ring-0"
                value={priceDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                  setPriceDisplay(raw ? Number(raw).toLocaleString("es-AR") : "");
                  setValue("price", raw ? Number(raw) : 0);
                }}
              />
            </div>
            {errors.price?.message && <span className={errorClass}>{errors.price.message}</span>}
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Seña</label>
            <div className="flex items-center border-b border-border">
              <span className="text-sm text-muted-foreground mr-1">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="flex-1 bg-transparent outline-none text-sm py-1 focus:ring-0"
                value={depositDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                  setDepositDisplay(raw ? Number(raw).toLocaleString("es-AR") : "");
                  setValue("depositAmount", raw ? Number(raw) : 0);
                }}
              />
            </div>
            {errors.depositAmount?.message && (
              <span className={errorClass}>{errors.depositAmount.message}</span>
            )}
          </div>
        </div>

        {/* Duración */}
        <div className="flex flex-col">
          <label className={labelClass}>Duración</label>
          <Select
            defaultValue={String(serviceData?.duration ?? 30)}
            onValueChange={(val) => setValue("duration", Number(val))}
          >
            <SelectTrigger className="px-0 h-9 bg-transparent border-0 border-b rounded-none shadow-none text-sm focus:ring-0">
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
                  <SelectItem key={minutes} value={String(minutes)} className="text-xs">
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción */}
        <div className="flex flex-col">
          <label className={labelClass}>Descripción</label>
          <textarea
            className="bg-transparent border-b border-border text-sm py-1.5 outline-none resize-none overflow-hidden"
            rows={1}
            maxLength={140}
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
          className="flex-1 h-11 text-white bg-orange-600 hover:bg-orange-700"
          onClick={handleSubmitClick}
        >
          <LuSave size={18} /> Guardar
        </Button>
      </div>
    </div>
  );
};

export default EditServiceModal;
