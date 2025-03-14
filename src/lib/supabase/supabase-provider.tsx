"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"
import { SWRConfig } from 'swr'

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [supabase] = useState(() => createClientComponentClient())

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {})

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 10000,
      }}
    >
      <Context.Provider value={{ supabase }}>
        {children}
      </Context.Provider>
    </SWRConfig>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used within SupabaseProvider")
  }
  return context
}
