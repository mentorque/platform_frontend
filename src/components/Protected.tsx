import { useEffect, useState } from "react"
import { listenToAuth } from "@/lib/auth"

export default function Protected({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const stop = listenToAuth((u) => {
      console.log("Auth state changed:", u ? `User: ${u.uid}` : "No user");
      setUser(u)
      setReady(true)
      if (!u) {
        console.log("No user found, redirecting to sign-in");
        window.location.href = "/signin"
        return
      }
      console.log("User authenticated, showing protected content");
    })
    return stop
  }, [])

  if (!ready) return null
  if (!user) return null
  return <>{children}</>
}


