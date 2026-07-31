import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('mint_theme') === 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      localStorage.setItem('mint_theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('mint_theme', 'light')
    }
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark, toggleDark: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
