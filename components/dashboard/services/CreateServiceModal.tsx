"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { LuLoader, LuCheck, LuPlus, LuTag } from "react-icons/lu";
import { IEmployee } from "@/interfaces/employee.interface";
import { useState } from "react";
import {
  DurationPicker, chipBase, chipOff, chipOn, descInput, errorText, fieldLabel,
  moneyInput, moneyPrefix, moneyRow, titleInput,
} from "./serviceFormUI";

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

const DURATIONS = [
  ...Array.from({ length: 8 }, (_, i) => (i + 1) * 15),
  ...Array.from({ length: 6 }, (_, i) => 150 + i * 30),
  ...Array.from({ length: 19 }, (_, i) => (i + 6) * 60),
];

const CreateServiceModal: React.FC<props> = ({ mpLinked, isLoading, employees = [], onCreateService }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");
  const duration = watch("duration");
  const price = watch("price");
  const deposit = watch("depositAmount");
  const depositShare = price && deposit ? Math.round((deposit / price) * 100) : null;

  // Los desactivados no toman turnos, así que no hay nada que asignarles. Un
  // dueño no publicado como prestador queda inactive y también sale de la lista.
  const assignableEmployees = employees.filter((e) => e.status !== "inactive");
  const ownerRecord = assignableEmployees.find((e) => e.isOwner);

  // El dueño arranca tildado: un servicio nuevo que él no marque lo dejaría
  // fuera del filtro público de ese servicio sin que nada se lo avise.
  const [employeeIDs, setEmployeeIDs] = useState<string[]>(() =>
    ownerRecord?._id ? [ownerRecord._id] : []
  );

  const toggleEmployee = (id: string) =>
    setEmployeeIDs((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

  const handleSubmitClick = () => {
    (document.querySelector(".inputSubmitField") as HTMLElement)?.click();
  };

  return (
    // Header y footer fijos, scroll sólo en el cuerpo: scrollear el contenedor
    // con padding hacía que la barra vertical le comiera ancho a los hijos
    // `w-full` y apareciera además una barra horizontal.
    <div className="flex flex-col w-full min-h-0">
      <div className="shrink-0 px-6 pt-6 pb-4 pr-12 border-b border-gray-100 flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 text-orange-600 shrink-0">
          <LuTag size={17} />
        </span>
        <div className="flex flex-col min-w-0">
          <h4 className="text-lg leading-none font-semibold text-gray-800">Nuevo servicio</h4>
          <p className="text-xs text-gray-400 mt-1">Completá los datos del servicio</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => onCreateService({ ...data, employeeIDs }))}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 flex flex-col gap-5 2xl:gap-6"
      >
        <div className="flex flex-col gap-1">
          <label className={fieldLabel}>Nombre</label>
          <input
            placeholder="Corte de cabello"
            type="text"
            maxLength={30}
            className={titleInput}
            {...register("name")}
          />
          {errors.name?.message && <span className={errorText}>{errors.name.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className={fieldLabel}>Descripción</label>
          <textarea
            className={descInput}
            maxLength={140}
            placeholder="Lavado, corte y peinado"
            rows={2}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = el.scrollHeight + "px";
            }}
            {...register("description")}
          />
          {errors.description?.message && (
            <span className={errorText}>{errors.description.message}</span>
          )}
        </div>

        {/* Los importes van en cuerpo grande: en mobile se apilan para que un
            precio de siete cifras no quede apretado contra la seña. */}
        <div className={`grid gap-5 ${mpLinked ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <div className="flex flex-col gap-1 min-w-0">
            <label className={fieldLabel}>Precio</label>
            <div className={moneyRow}>
              <span className={moneyPrefix}>$</span>
              <input
                type="text"
                inputMode="numeric"
                className={moneyInput}
                placeholder="0"
                value={priceDisplay}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                  setPriceDisplay(raw ? Number(raw).toLocaleString("es-AR") : "");
                  setValue("price", raw ? Number(raw) : 0);
                  // La seña se valida contra el precio: al cambiarlo hay que
                  // revalidarla para que el cartel aparezca o se vaya solo.
                  if (depositDisplay) trigger("depositAmount");
                }}
              />
            </div>
            {errors.price?.message && <span className={errorText}>{errors.price.message}</span>}
          </div>

          {mpLinked && (
            <div className="flex flex-col gap-1 min-w-0">
              <label className={fieldLabel}>Seña</label>
              <div className={moneyRow}>
                <span className={moneyPrefix}>$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className={moneyInput}
                  placeholder="0"
                  value={depositDisplay}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                    setDepositDisplay(raw ? Number(raw).toLocaleString("es-AR") : "");
                    setValue("depositAmount", raw ? Number(raw) : 0, {
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
              {errors.depositAmount?.message ? (
                <span className={errorText}>{errors.depositAmount.message}</span>
              ) : (
                depositShare !== null && (
                  <span className="text-[11px] text-gray-400 mt-1">
                    {depositShare}% del precio
                  </span>
                )
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className={fieldLabel}>Duración</label>
          <DurationPicker
            value={duration}
            options={DURATIONS}
            onChange={(minutes) => setValue("duration", minutes, { shouldValidate: true })}
          />
          {errors.duration?.message && (
            <span className={errorText}>{errors.duration.message}</span>
          )}
        </div>

        {assignableEmployees.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className={fieldLabel}>Quién lo presta</label>
            <div className="flex flex-wrap gap-1.5">
              {assignableEmployees.map((emp) => {
                const selected = employeeIDs.includes(emp._id!);
                return (
                  <button
                    key={emp._id}
                    type="button"
                    onClick={() => toggleEmployee(emp._id!)}
                    className={`${chipBase} ${selected ? chipOn : chipOff}`}
                  >
                    {selected ? (
                      <LuCheck size={11} strokeWidth={3} />
                    ) : (
                      <LuPlus size={11} strokeWidth={2.5} />
                    )}
                    {emp.isOwner ? "Vos" : `${emp.name} ${emp.surname}`}
                  </button>
                );
              })}
            </div>
            {employeeIDs.length === 0 && (
              <span className="text-[11px] text-gray-400">
                Sin nadie tildado, este servicio no va a tener prestador asignado.
              </span>
            )}
          </div>
        )}

        <button type="submit" className="inputSubmitField hidden" />
      </form>

      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-gray-100">
        <button
          className="w-full flex items-center justify-center bg-primary hover:bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmitClick}
          disabled={isLoading}
        >
          {isLoading ? <LuLoader size={16} className="animate-spin" /> : "Crear servicio"}
        </button>
      </div>
    </div>
  );
};

export default CreateServiceModal;
