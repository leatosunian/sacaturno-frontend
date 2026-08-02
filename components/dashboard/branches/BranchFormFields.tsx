"use client";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BranchFormData } from "@/app/schemas/branchSchema";
import { LuBuilding2, LuMapPin, LuPhone, LuMail } from "react-icons/lu";

const labelCls = "text-xs font-bold uppercase text-gray-700";

const fieldCls = (hasError: boolean) =>
  `h-9 w-full rounded-md border px-3 text-sm bg-[rgb(245,245,245)] focus:outline-none transition-colors ${
    hasError ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-orange-600"
  }`;

interface Props {
  register: UseFormRegister<BranchFormData>;
  errors: FieldErrors<BranchFormData>;
}

const BranchFormFields: React.FC<Props> = ({ register, errors }) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <label className={labelCls}>
        <span className="flex items-center gap-1.5"><LuBuilding2 size={11} /> Nombre de la sucursal *</span>
      </label>
      <input
        type="text"
        {...register("name")}
        placeholder="Ej: Sucursal Centro"
        maxLength={50}
        className={fieldCls(!!errors.name)}
      />
      {errors.name?.message && <span className="text-xs text-red-500">{errors.name.message}</span>}
    </div>
    <div className="flex gap-3">
      <div className="flex flex-col gap-1 flex-1">
        <label className={labelCls}>
          <span className="flex items-center gap-1.5"><LuMapPin size={11} /> Calle *</span>
        </label>
        <input
          type="text"
          {...register("street")}
          placeholder="Av. Corrientes"
          maxLength={70}
          className={fieldCls(!!errors.street)}
        />
        {errors.street?.message && <span className="text-xs text-red-500">{errors.street.message}</span>}
      </div>
      <div className="flex flex-col gap-1 w-24">
        <label className={labelCls}>Altura *</label>
        <input
          type="text"
          {...register("number")}
          placeholder="1234"
          maxLength={5}
          className={fieldCls(!!errors.number)}
        />
        {errors.number?.message && <span className="text-xs text-red-500 leading-tight">{errors.number.message}</span>}
      </div>
    </div>
    <div className="flex gap-3">
      <div className="flex flex-col gap-1 flex-1">
        <label className={labelCls}>Ciudad</label>
        <input
          type="text"
          {...register("city")}
          placeholder="Buenos Aires"
          maxLength={50}
          className={fieldCls(!!errors.city)}
        />
        {errors.city?.message && <span className="text-xs text-red-500">{errors.city.message}</span>}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className={labelCls}>Provincia</label>
        <input
          type="text"
          {...register("province")}
          placeholder="CABA"
          maxLength={50}
          className={fieldCls(!!errors.province)}
        />
        {errors.province?.message && <span className="text-xs text-red-500">{errors.province.message}</span>}
      </div>
    </div>
    <div className="flex gap-3">
      <div className="flex flex-col gap-1 flex-1">
        <label className={labelCls}>
          <span className="flex items-center gap-1.5"><LuPhone size={11} /> Teléfono *</span>
        </label>
        <input
          type="tel"
          {...register("phone")}
          placeholder="1122334455"
          maxLength={15}
          className={fieldCls(!!errors.phone)}
        />
        {errors.phone?.message && <span className="text-xs text-red-500">{errors.phone.message}</span>}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className={labelCls}>
          <span className="flex items-center gap-1.5"><LuMail size={11} /> Email</span>
        </label>
        <input
          type="email"
          {...register("email")}
          placeholder="sucursal@empresa.com"
          maxLength={80}
          className={fieldCls(!!errors.email)}
        />
        {errors.email?.message && <span className="text-xs text-red-500">{errors.email.message}</span>}
      </div>
    </div>
  </div>
);

export default BranchFormFields;
