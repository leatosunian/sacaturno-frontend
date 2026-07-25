"use client"

import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IPublicBranch {
  _id: string
  name: string
  street?: string
  number?: string
  city?: string
  province?: string
}

interface Props {
  branches: IPublicBranch[]
  selected: string | null
  onSelect: (id: string | null) => void
  mobile?: boolean
}

export default function BranchSelector({ branches, selected, onSelect, mobile = false }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 mb-1">
        <MapPin className={cn(mobile ? "size-4" : "size-3.5", "text-muted-foreground")} />
        <span className={cn(
          "font-semibold tracking-wide uppercase text-muted-foreground",
          mobile ? "text-sm" : "text-xs"
        )}>
          Sucursal
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "shrink-0 rounded-full border font-semibold px-4 py-1.5 text-sm transition-all",
            selected === null
              ? "bg-[#e85d24] text-white border-transparent shadow"
              : "bg-muted/50 text-muted-foreground border-border hover:border-orange-400 hover:text-foreground"
          )}
        >
          Todas
        </button>
        {branches.map((branch) => (
          <button
            key={branch._id}
            onClick={() => onSelect(branch._id)}
            className={cn(
              "shrink-0 rounded-full border font-semibold px-4 py-1.5 text-sm transition-all",
              selected === branch._id
                ? "bg-[#e85d24] text-white border-transparent shadow"
                : "bg-muted/50 text-muted-foreground border-border hover:border-orange-400 hover:text-foreground"
            )}
          >
            {branch.name}
          </button>
        ))}
      </div>
    </div>
  )
}
