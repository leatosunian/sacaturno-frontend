"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createServiceSchema } from "@/app/schemas/createServiceSchema";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useRef, useState } from "react";
import { LuSave, LuTag, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import {
  DurationPicker, descInput, errorText, fieldLabel, moneyInput, moneyPrefix,
  moneyRow, titleInput,
} from "./serviceFormUI";

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

const DURATIONS = [15, 20, 30, 40, 45, 60, 75, 90, 120];

const EditServiceModal: React.FC<props> = ({ mpLinked, onEditService, onDeleteService, serviceData }) => {
  const {
    register, handleSubmit, setValue, reset, trigger, watch,
    formState: { errors, isDirty },
  } = useForm<formInputs>({ resolver: zodResolver(createServiceSchema) });

  const [priceDisplay, setPriceDisplay] = useState<string>("");
  const [depositDisplay, setDepositDisplay] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const descRef = useRef<HTMLTextAreaElement | null>(null);
  const duration = watch("duration");
  const price = watch("price");
  const deposit = watch("depositAmount");
  const depositShare = price && deposit ? Math.round((deposit / price) * 100) : null;
  // El campo también se muestra sin Mercado Pago vinculado cuando el servicio ya
  // tiene una seña guardada: si no, no habría manera de ponerla en cero desde el
  // panel y el servicio se queda sin poder reservarse.
  const showDeposit = mpLinked || (serviceData?.depositAmount ?? 0) > 0;
  const depositBlocksBooking = !mpLinked && (deposit ?? 0) > 0;

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
    setConfirmDelete(false);
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
    // Misma estructura que el alta: header y acciones fijos, scroll sólo en el
    // cuerpo. Antes este modal no tenía tope de alto y en pantallas bajas se
    // desbordaba del viewport dejando los botones fuera de alcance.
    <div className="flex flex-col w-full min-h-0">
      <div className="shrink-0 px-6 pt-6 pb-4 pr-12 border-b border-gray-100 flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 text-orange-600 shrink-0">
          <LuTag size={17} />
        </span>
        <div className="flex flex-col min-w-0">
          <h4 className="text-lg leading-none font-semibold text-gray-800">Editar servicio</h4>
          <p className="text-xs text-gray-400 mt-1 truncate">{serviceData?.name}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(editService)}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 flex flex-col gap-5 2xl:gap-6"
      >
        <div className="flex flex-col gap-1">
          <label className={fieldLabel}>Nombre</label>
          <input
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
            <span className={errorText}>{errors.description.message}</span>
          )}
        </div>

        {/* Los importes van en cuerpo grande: en mobile se apilan para que un
            precio de siete cifras no quede apretado contra la seña. */}
        <div className={`grid gap-5 ${showDeposit ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
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
                  setValue("price", raw ? Number(raw) : 0, { shouldDirty: true });
                  // La seña se valida contra el precio: al cambiarlo hay que
                  // revalidarla para que el cartel aparezca o se vaya solo.
                  if (depositDisplay) trigger("depositAmount");
                }}
              />
            </div>
            {errors.price?.message && <span className={errorText}>{errors.price.message}</span>}
          </div>

          {showDeposit && (
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
                      shouldDirty: true,
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

        {depositBlocksBooking && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 -mt-2">
            <LuTriangleAlert size={13} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-snug">
              Este servicio pide seña pero no tenés Mercado Pago vinculado: nadie
              va a poder reservarlo hasta que lo vincules o dejes la seña en 0.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className={fieldLabel}>Duración</label>
          <DurationPicker
            value={duration}
            options={DURATIONS}
            onChange={(minutes) => setValue("duration", minutes, { shouldDirty: true })}
          />
        </div>

        <button type="submit" className="inputSubmitField hidden" />
      </form>

      {/* Eliminar baja de jerarquía: es un link discreto, no la mitad del pie, y
          pide confirmación en el lugar antes de borrar. */}
      <div className="shrink-0 px-6 pb-6 pt-4 border-t border-gray-100">
        {!confirmDelete ? (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-600 transition-colors duration-200 cursor-pointer"
              onClick={() => setConfirmDelete(true)}
            >
              <LuTrash2 size={14} /> Eliminar
            </button>
            <button
              type="button"
              disabled={!isDirty}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-orange-500 text-white text-sm font-semibold px-8 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              onClick={handleSubmitClick}
            >
              <LuSave size={16} /> Guardar
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-xs text-red-600 text-center font-medium">
              ¿Eliminar <strong>{serviceData?.name}</strong>? Los turnos ya
              reservados lo conservan, pero deja de estar disponible para nuevas
              reservas.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 h-8 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer"
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer"
                onClick={() => onDeleteService(serviceData?._id)}
              >
                Confirmar eliminación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditServiceModal;
