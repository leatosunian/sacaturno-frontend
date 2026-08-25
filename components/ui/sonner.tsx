"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

// El panel es claro y no hay ThemeProvider en la app: fijamos el tema para que
// Sonner no aplique sus estilos oscuros si alguna vez se agrega uno.
const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme="light" className="toaster group" {...props} />
}

export { Toaster }
