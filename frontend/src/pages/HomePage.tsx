import React from 'react'
import {motion} from 'framer-motion'
import {Link} from 'react-router-dom'
import {FaFacebook, FaInstagram, FaLinkedin} from 'react-icons/fa'
import Typewriter from '@/MyComponents/TypeWriter'
import AuroraBg from '@/MyComponents/AuroraBg'

const clubLanguages = [
  "CLUB.",    // English
  "俱乐部.",   // Chinese (Jùlèbù)
  "CLUB.",    // Spanish
  "نادي.",    // Arabic (Nadi) - Note: Browsers handle RTL inside the string
  "クラブ.",   // Japanese (Kurabu)
  "КЛУБ."     // Russian
];

const HomePage = () => {
  return (
    <div className='flex justify-between items-center py-2 px-4 w-[85%] mt-20 mx-auto'>
      <AuroraBg />
      <div
        className="relative z-10 flex flex-col justify-center items-start w-[85%] mx-auto"
      >
        <h2 className='text-5xl text-[var(--primary)] font-bold tracking-wide'>
          INDUSTRIAL
        </h2>
        <h2 className='text-5xl mt-2 font-bold tracking-wide'>
          ENGINEERS <Typewriter words={clubLanguages} speed={150} pause={1500} />
        </h2>
        <p className='text-lg w-[50%] mt-6 text-[var(--muted-foreground)]'>
          Plus qu'un club. "Industrial Engineers Club" est un club du Génie Industriel.
        </p>
        <div className='flex items-center gap-5 mt-8'>
          <Link to="https://www.facebook.com/IEC.ENP" className='text-[var(--foreground)] hover:text-[var(--primary)] transition-colors'>
            <FaFacebook size={22} />
          </Link>
          <Link to="https://www.instagram.com/iec.enp/" className='text-[var(--foreground)] hover:text-[var(--primary)] transition-colors'>
            <FaInstagram size={22} />
          </Link>
          <Link to="https://www.linkedin.com/company/industrial-engineers-club-iec" className='text-[var(--foreground)] hover:text-[var(--primary)] transition-colors'>
            <FaLinkedin size={22} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage
