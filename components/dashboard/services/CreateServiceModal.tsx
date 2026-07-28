"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuLoader } from "react-icons/lu";

interface formInputs {
  name: string;
  price: number;
  description: string;
  duration?: number;
  depositAmount?: number;
}

interface props {
  mpLinked?: boolean;
  isLoading?: boolean;
  onCreateService: (formData: formInputs) => void;
}

const inputClass =
  "h-9 w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100 placeholder:text-gray-400";
const labelClass = "text-xs font-medium text-gray-600";
const errorClass = "text-xs text-red-500 mt-0.5";

const CreateServiceModal: React.FC<props> = ({ mpLinked, isLoading, onCreateService }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");

  const handleSubmitClick = () => {
    (document.querySelector(".inputSubmitField") as HTMLElement)?.click();
  };

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="pb-4 border-b gap-1 flex flex-col border-gray-100">
        <h4 className="text-lg leading-none font-semibold text-gray-800">Nuevo servicio</h4>
        <p className="text-xs text-gray-400 mt-0.5">Completá los datos del servicio</p>
      </div>

      <form
        onSubmit={handleSubmit((data) => onCreateService(data))}
        className="flex flex-col w-full gap-4"
      >
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Nombre</label>
          <input
            placeholder="Ej: Corte de cabello"
            type="text"
            maxLength={30}
            className={inputClass}
            {...register("name")}
          />
          {errors.name?.message && (
            <span className={errorClass}>{errors.name.message}</span>
          )}
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
                  setValue("price", raw ? Number(raw) : 0);
                }}
              />
            </div>
            {errors.price?.message && (
              <span className={errorClass}>{errors.price.message}</span>
            )}
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
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Duración</label>
          <Select onValueChange={(val) => setValue("duration", Number(val))}>
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-[rgb(235,235,235)] hover:border-orange-600 focus:ring-0 focus:border-orange-600 transition-all duration-200">
              <SelectValue placeholder="Seleccioná la duración" />
            </SelectTrigger>
            <SelectContent>
              {[
                ...Array.from({ length: 8 }, (_, i) => (i + 1) * 15),
                ...Array.from({ length: 6 }, (_, i) => 150 + i * 30),
                ...Array.from({ length: 19 }, (_, i) => (i + 6) * 60),
              ].map((minutes) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                const label =
                  hours > 0
                    ? mins > 0
                      ? `${hours}h ${mins}min`
                      : `${hours} hora${hours > 1 ? "s" : ""}`
                    : `${mins} min`;
                return (
                  <SelectItem key={minutes} value={String(minutes)} className="text-sm">
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.duration?.message && (
            <span className={errorClass}>{errors.duration.message}</span>
          )}
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Descripción</label>
          <textarea
            className="w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 py-2 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100 resize-none overflow-hidden placeholder:text-gray-400"
            maxLength={140}
            placeholder="Describí el servicio brevemente"
            rows={2}
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

      <button
        className="w-full flex mt-2 items-center justify-center bg-orange-600 hover:bg-[#d92f04] text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSubmitClick}
        disabled={isLoading}
      >
        {isLoading ? <LuLoader size={16} className="animate-spin" /> : "Crear servicio"}
      </button>
    </div>
  );
};

export default CreateServiceModal;
