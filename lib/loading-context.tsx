'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  incrementLoadingTasks: () => void
  decrementLoadingTasks: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingTasks, setLoadingTasks] = useState(0)

  const incrementLoadingTasks = useCallback(() => {
    setLoadingTasks((prev) => prev + 1)
  }, [])

  const decrementLoadingTasks = useCallback(() => {
    setLoadingTasks((prev) => Math.max(0, prev - 1))
  }, [])

  const isLoading = loadingTasks > 0

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setIsLoading: (loading) => setLoadingTasks(loading ? 1 : 0),
        incrementLoadingTasks,
        decrementLoadingTasks,
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoadingContext() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoadingContext must be used within LoadingProvider')
  }
  return context
}
