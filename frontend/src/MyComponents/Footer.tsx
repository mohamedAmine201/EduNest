import React from 'react'
import {FaPhoneAlt, FaEnvelope} from 'react-icons/fa'

const Footer = () => {
  return (
    <div className='flex flex-col items-center justify-center py-2 px-4'>
      <div className='flex items-center gap-2 font-bold md:text-lg '>
          <FaEnvelope className='mr-2 text-[var(--primary)]'/>
          <p>iec@g.enp.edu.dz</p>
      </div>
      <div className='flex items-center gap-2 font-bold md:text-lg '>
            <FaPhoneAlt className='mr-2 text-[var(--primary)]'/>
            <p>00 (123) 456 78 90 / 00 (987) 654 32 10</p>
      </div>
    </div>
  )
}

export default Footer