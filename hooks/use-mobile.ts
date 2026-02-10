import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)")
    const handleChange = () => setIsMobile(mql.matches)
    
    handleChange()
    mql.addListener(handleChange)
    
    return () => mql.removeListener(handleChange)
  }, [])

  return !!isMobile
}
