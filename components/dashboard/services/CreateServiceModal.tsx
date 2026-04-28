"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface formInputs {
  name: string;
  price: number;
  description: string;
  duration?: number;
  depositAmount?: number;
}

interface props {
  mpLinked?: boolean;
  onCreateService: (formData: formInputs) => void;
}

const labelClass = "text-xs font-bold tracking-wider uppercase";
const errorClass = "text-xs text-red-500 mt-0.5";
const underlineInput = "px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus:border-orange-600 transition-colors";

const CreateServiceModal: React.FC<props> = ({ mpLinked, onCreateService }) => {
  const {
    register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");

  const handleSubmitClick = () => {
    (document.querySelector(".inputSubmitField") as HTMLElement)?.click();
  };

  return (
    <div className="flex flex-col w-full gap-5">
      <h4 className="relative inline-block px-2 mx-auto text-xl font-bold text-center uppercase w-fit">
        Nuevo servicio
        <span
          className="absolute left-0 right-0 mx-auto"
          style={{ bottom: -2, height: 2, background: "#dd4924", width: "60%" }}
        />
      </h4>

      <form
        onSubmit={handleSubmit((data) => onCreateService(data))}
        className="flex flex-col w-full gap-4 pt-1"
      >
        {/* Nombre */}
        <div className="flex flex-col">
          <label className={labelClass}>Nombre</label>
          <Input
            type="text"
            maxLength={30}
            className={underlineInput}
            {...register("name")}
          />
          {errors.name?.message && <span className={errorClass}>{errors.name.message}</span>}
        </div>

        {/* Precio + Seña */}
        <div className={`grid gap-4 ${mpLinked ? "grid-cols-2" : "grid-cols-1"}`}>
          <div className="flex flex-col">
            <label className={labelClass}>Precio</label>
            <div className="flex items-center border-b border-border focus-within:border-orange-600 transition-colors">
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

          {mpLinked && (
            <div className="flex flex-col">
              <label className={labelClass}>Seña</label>
              <div className="flex items-center border-b border-border focus-within:border-orange-600 transition-colors">
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
          )}
        </div>

        {/* Duración */}
        <div className="flex flex-col">
          <label className={labelClass}>Duración</label>
          <Select onValueChange={(val) => setValue("duration", Number(val))}>
            <SelectTrigger className="px-0 h-9 bg-transparent border-0 border-b rounded-none shadow-none text-sm focus:ring-0 focus:border-orange-600 transition-colors">
              <SelectValue placeholder="Seleccioná la duración" />
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
          {errors.duration?.message && <span className={errorClass}>{errors.duration.message}</span>}
        </div>

        {/* Descripción */}
        <div className="flex flex-col">
          <label className={labelClass}>Descripción</label>
          <textarea
            className="bg-transparent border-b border-border text-sm py-1.5 outline-none resize-none overflow-hidden focus:border-orange-600 transition-colors"
            maxLength={140}
            placeholder="Ingresa una descripción"
            rows={1}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            {...register("description")}
          />
          {errors.description?.message && (
            <span className={errorClass}>{errors.description.message}</span>
          )}
        </div>

        <button type="submit" className="inputSubmitField hidden" />
      </form>

      <Button
        className="w-full h-11 mt-2 text-white bg-orange-600 hover:bg-orange-700"
        onClick={handleSubmitClick}
      >
        Crear servicio
      </Button>
    </div>
  );
};

export default CreateServiceModal;
