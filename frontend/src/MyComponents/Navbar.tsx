import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'
import logoDark from '../assets/logoIEC.png'
import { NavigationMenuBar, LoginLink } from './NavigationMenu'
import { ThemeToggle } from './ThemeToggle'
import { EnableNotificationsButton } from "./EnableNotificationsButton"
import { useAuth } from './AuthContext'

const Navbar = () => {
  const { token } = useAuth()

  return (
    <div className='flex justify-between items-end py-2 px-4 w-[70%] mx-auto'>
      <div className='flex items-end'>
        <Link to='/' className='hidden dark:inline'>
          <img src={logoDark} className='mr-2' />
        </Link>
        <Link to='/' className='mt-auto dark:hidden'>
          <img src={logo} className='mr-2' />
        </Link>
        <NavigationMenuBar />
      </div>
      <div className="flex items-center gap-2 ml-4">
        <LoginLink />
        {token && <EnableNotificationsButton />}
        <ThemeToggle />
      </div>
    </div>
  )
}

export default Navbar