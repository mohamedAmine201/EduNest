import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from './AuthContext'
import { ThemeToggle } from './ThemeToggle'
import { EnableNotificationsButton } from './EnableNotificationsButton'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function HamburgerMenu() {
  const [open, setOpen] = useState(false)
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    toast.success("You've been successfully logged out!", { position: 'bottom-right' })
    logout()
    navigate('/')
    setOpen(false)
  }

  const close = () => setOpen(false)

  return (
    <div className='md:hidden '>
      {/* Trigger */}
      <button onClick={() => setOpen(true)} className='text-[var(--foreground)]'>
        <Menu size={24} />
      </button>

      {/* Blur Overlay */}
      <div
        onClick={close}
        className={`fixed inset-0 z-40 backdrop-blur-sm bg-black/30 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-[75%] max-w-xs z-50 bg-[var(--background)] shadow-xl flex flex-col px-6 py-8 gap-6 transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className='flex justify-between items-center mb-2'>
          <span className='text-lg font-bold tracking-wide text-[var(--primary)]'>Menu</span>
          <button onClick={close} className='text-[var(--foreground)] hover:text-[var(--primary)] transition-colors'>
            <X size={22} />
          </button>
        </div>

        {/* Links */}
        <nav className='flex flex-col gap-4'>
          <Link to="/" onClick={close} className='text-sm font-medium hover:text-[var(--primary)] transition-colors'>Home</Link>
          <Link to="/rooms" onClick={close} className='text-sm font-medium hover:text-[var(--primary)] transition-colors'>Rooms</Link>

          {user?.role === 'HEAD' && (
            <Link to="/users" onClick={close} className='text-sm font-medium hover:text-[var(--primary)] transition-colors'>Users</Link>
          )}
          {user?.role === 'TEACHER' && (
            <Link to="/data" onClick={close} className='text-sm font-medium hover:text-[var(--primary)] transition-colors'>Data</Link>
          )}
          {user?.role === 'STUDENT' && (
            <Link to="/grades" onClick={close} className='text-sm font-medium hover:text-[var(--primary)] transition-colors'>Grades</Link>
          )}

          <Link to="/profile" onClick={close} className='text-sm font-medium hover:text-[var(--primary)] transition-colors'>Profile</Link>
        </nav>

        {/* Bottom actions */}
        <div className='mt-auto flex flex-col gap-4 pt-4 border-t border-[var(--border)]'>
          <div className='flex items-center gap-3'>
            {token && <EnableNotificationsButton />}
            <ThemeToggle />
          </div>
          {token ? (
            <Button variant="outline" className='w-full' onClick={handleLogout}>Logout</Button>
          ) : (
            <Link to="/login" onClick={close} className='w-full'>
              <Button variant="outline" className='w-full'>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}