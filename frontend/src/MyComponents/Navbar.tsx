import React from 'react'
import {Link} from 'react-router-dom'
import logo from '../assets/logoIEC.png'
import { NavigationMenuDemo, LoginLink } from './NavigationMenu'

const Navbar = () => {
  return (
    <div className='flex justify-between items-end py-2 px-4 w-[70%] mx-auto'>
        <div className='flex items-end'>
          <Link to='/'>
          <img src={logo} className='mr-2'/>
          </Link>
          <NavigationMenuDemo />
        </div>
        <div>
          <LoginLink />
        </div>
    </div>
  )
}

export default Navbar