import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'
import logoDark from '../assets/logoIEC.svg'
import { NavigationMenuBar, LoginLink } from './NavigationMenu'
import { HamburgerMenu } from './HamburgerMenu'
import { ThemeToggle } from './ThemeToggle'
import { EnableNotificationsButton } from "./EnableNotificationsButton"
import { useAuth } from './AuthContext'

const Navbar = () => {
  const { token } = useAuth()
  return (
    <div className='relative flex justify-between items-end py-2 px-4 w-full md:w-[70%] mx-auto'>
      <div className='flex items-end'>
        <Link to='/' className='hidden dark:inline'>
          <img src={logoDark} className='mr-2' />
        </Link>
        <Link to='/' className='mt-auto inline dark:hidden'>
          <img src={logo} className='mr-2 w-fit' />
        </Link>
        <span className='hidden md:block'>
          <NavigationMenuBar />
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2 ml-4">
        <LoginLink />
        {token && <EnableNotificationsButton />}
        <ThemeToggle />
      </div>

      {/* Mobile */}
      <HamburgerMenu />
    </div>
  )
}
export default Navbar