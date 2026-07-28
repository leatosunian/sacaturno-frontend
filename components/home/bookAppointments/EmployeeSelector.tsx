"use client"

import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IPublicEmployee {
  _id: string
  name: string
  surname: string
  branches: string[]
  services: string[]
  profileImage?: string
}

interface Props {
  employees: IPublicEmployee[]
  selected: string | null
  onSelect: (id: string | null) => void
  mobile?: boolean
}

export default function EmployeeSelector({ employees, selected, onSelect, mobile = false }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 mb-1">
        <Users className={cn(mobile ? "size-4" : "size-3.5", "text-muted-foreground")} />
        <span className={cn(
          "font-semibold tracking-wide uppercase text-muted-foreground",
          mobile ? "text-sm" : "text-xs"
        )}>
          Profesional
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto py-1 scrollbar-hide">
        {/* "Cualquier profesional" card */}
        <button
          onClick={() => onSelect(null)}
          className="flex flex-col items-center gap-1 cursor-pointer shrink-0 focus:outline-none"
        >
          <div className={cn(
            "size-10 rounded-full flex items-center justify-center transition-all",
            selected === null
              ? "bg-[#e85d24] text-white ring-2 ring-orange-400 ring-offset-1"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}>
            <Users className="size-4" />
          </div>
          <span className={cn(
            "text-xs font-semibold text-center w-16 leading-tight",
            selected === null ? "text-[#e85d24]" : "text-muted-foreground"
          )}>
            Cualquiera
          </span>
        </button>

        {employees.map((emp) => {
          const initials = `${emp.name[0] ?? ""}${emp.surname[0] ?? ""}`.toUpperCase()
          const isSelected = selected === emp._id
          return (
            <button
              key={emp._id}
              onClick={() => onSelect(emp._id)}
              className="flex flex-col items-center gap-1 cursor-pointer shrink-0 focus:outline-none"
            >
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                isSelected
                  ? "bg-[#e85d24] text-white ring-2 ring-orange-400 ring-offset-1"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}>
                {initials}
              </div>
              <span className={cn(
                "text-xs font-semibold text-center w-16 truncate leading-tight",
                isSelected ? "text-[#e85d24]" : "text-muted-foreground"
              )}>
                {emp.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
