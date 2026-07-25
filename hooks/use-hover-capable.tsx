import * as React from "react"

export function useHoverCapable() {
  const [hoverCapable, setHoverCapable] = React.useState(true)

  React.useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)")
    const onChange = () => setHoverCapable(mql.matches)
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return hoverCapable
}
