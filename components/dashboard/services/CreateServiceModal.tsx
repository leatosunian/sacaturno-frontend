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
import { LuLoader, LuCheck, LuPlus } from "react-icons/lu";
import { IEmployee } from "@/interfaces/employee.interface";

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
  employees?: IEmployee[];
  onCreateService: (formData: formInputs & { employeeIDs: string[] }) => void;
}

const inputClass =
  "h-9 w-full rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100 placeholder:text-gray-400";
const labelClass = "text-xs font-medium text-gray-600";
const errorClass = "text-xs text-red-500 mt-0.5";

const CreateServiceModal: React.FC<props> = ({ mpLinked, isLoading, employees = [], onCreateService }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");
  const [employeeIDs, setEmployeeIDs] = useState<string[]>([]);

  // Los desactivados no toman turnos, así que no hay nada que asignarles.
  const assignableEmployees = employees.filter((e) => e.status !== "inactive");

  const toggleEmployee = (id: string) =>
    setEmployeeIDs((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

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
        onSubmit={handleSubmit((data) => onCreateService({ ...data, employeeIDs }))}
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
            <div className="flex items-center h-9 rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-3 transition-all duration-200 ease-in-out hover:border-orange-600 focus-within:border-orange-600 focus-within:bg-gray-100">
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
              <div className="flex items-center h-9 rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-3 transition-all duration-200 ease-in-out hover:border-orange-600 focus-within:border-orange-600 focus-within:bg-gray-100">
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
            <SelectTrigger className="h-9 text-sm border-gray-200 bg-[rgb(245,245,245)] hover:border-orange-600 focus:ring-0 focus:border-orange-600 transition-all duration-200">
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
            className="w-full rounded-md border border-gray-200 bg-[rgb(245,245,245)] px-3 py-2 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100 resize-none overflow-hidden placeholder:text-gray-400"
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

        {/* Empleados que prestan el servicio */}
        {assignableEmployees.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className={labelClass}>Quién lo presta</label>
            <div className="flex flex-wrap gap-1.5 rounded-md border border-gray-200 bg-gray-50 p-3">
              {assignableEmployees.map((emp) => {
                const selected = employeeIDs.includes(emp._id!);
                return (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => toggleEmployee(emp._id!)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 ease-in-out cursor-pointer ${
                      selected
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-400 border-gray-200 hover:border-orange-300 hover:text-gray-600"
                    }`}
                  >
                    {selected ? (
                      <LuCheck size={10} strokeWidth={3} />
                    ) : (
                      <LuPlus size={10} strokeWidth={2.5} />
                    )}
                    {emp.name} {emp.surname}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-gray-400 mt-0.5">
              {employeeIDs.length === 0
                ? "Si no elegís a nadie, el servicio queda solo para vos."
                : "Podés cambiarlo después desde Mi equipo."}
            </span>
          </div>
        )}

        <button type="submit" className="inputSubmitField hidden" />
      </form>

      <button
        className="w-full flex mt-2 items-center justify-center bg-primary hover:bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={handleSubmitClick}
        disabled={isLoading}
      >
        {isLoading ? <LuLoader size={16} className="animate-spin" /> : "Crear servicio"}
      </button>
    </div>
  );
};

export default CreateServiceModal;
