'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import SearchPanel from './SearchPanel'

interface SearchContextType {
  open: () => void
  close: () => void
}

const SearchContext = createContext<SearchContextType>({ open: () => {}, close: () => {} })

export function useSearch() {
  return useContext(SearchContext)
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  return (
    <SearchContext.Provider value={{ open, close }}>
      {children}
      {isOpen && <SearchPanel open={isOpen} onClose={close} />}
    </SearchContext.Provider>
  )
}
