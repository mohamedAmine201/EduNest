import React from 'react'
import {motion} from 'framer-motion'
import {Link} from 'react-router-dom'
import HomePic1 from '../assets/front-view-festive-graduation-arrangement.jpg'
import HomePic2 from '../assets/shipping-containers-port-sunset.jpg'
import {FaFacebook, FaInstagram, FaLinkedin} from 'react-icons/fa'
import Typewriter from '@/MyComponents/TypeWriter'

const HomePage = () => {
  return (
    <div className='flex justify-between items-center py-2 px-4 w-[85%] mx-auto'>
      <motion.div className="flex flex-col justify-center items-start"
      initial={{ x: "-100vh", opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      transition={{ duration: 0.8 }}
      >
        <h2 className='text-4xl text-[var(--primary)] font-bold'>
          INDUSTRIAL
        </h2>
        <h2 className='text-4xl mt-2 font-bold'>
          ENGINEERS <Typewriter text='CLUB.' />
        </h2>
        <p className='text-lg w-[60%] mt-6'>
          Plus qu'un club. "Industrial Engineers Club" est un club du Génie Industriel. 
        </p>
        <div className='flex items-center gap-4 mt-6'>
          <Link to="https://www.facebook.com/IEC.ENP">
          <FaFacebook />
          </Link>
          <Link to="https://www.instagram.com/iec.enp/">
            <FaInstagram />
          </Link>
          <Link to="https://www.linkedin.com/company/industrial-engineers-club-iec">
            <FaLinkedin />
          </Link>
        </div>
      </motion.div>
      <motion.div 
      className='flex flex-col w-[460px] gap-2'
      initial = {{x: '100vh', opacity: 0}}
      animate = {{x: 0, opacity: 1}}
      transition = {{duration: 0.8}}
      >
        <img src={HomePic1} className='w-58 rounded-lg self-end'/>
        <img src={HomePic2} className='w-58 rounded-lg self-start'/>
      </motion.div>
    </div>
  )
}

export default HomePage