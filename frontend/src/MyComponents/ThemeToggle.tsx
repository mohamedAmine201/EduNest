// ThemeToggle.tsx
import { FiSun, FiMoon } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Sync state with the actual class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const root = document.documentElement
    const newTheme = root.classList.contains('dark') ? 'light' : 'dark'
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="cursor-pointer">
      {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
    </Button>
  )
}