import React from 'react'
import {motion} from 'framer-motion'
import { LoginCard } from '../MyComponents/LoginForm'

const LoginPage = () => {
  return (
    <motion.div className='flex justify-center items-center py-2 px-4'
    initial = {{y: '100vh', opacity: 0}}
    animate = {{y: 0, opacity: 1}}
    transition = {{duration: 0.8}}
    >
        <LoginCard />
    </motion.div>
  )
}

export default LoginPage