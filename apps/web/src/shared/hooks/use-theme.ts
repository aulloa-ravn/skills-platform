import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      if (prevTheme === 'light') return 'dark'
      return 'light'
    })
  }

  const setLightMode = () => setTheme('light')
  const setDarkMode = () => setTheme('dark')

  return {
    theme,
    toggleTheme,
    setLightMode,
    setDarkMode,
    isDark: theme === 'dark',
  }
}
