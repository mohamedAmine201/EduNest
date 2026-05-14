import React from 'react'
import {motion} from 'framer-motion'
import {Link} from 'react-router-dom'
import {FaFacebook, FaInstagram, FaLinkedin} from 'react-icons/fa'
import Typewriter from '@/MyComponents/TypeWriter'
import AuroraBg from '@/MyComponents/AuroraBg'
import { Button } from '@/components/ui/button'

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
    <div className='flex justify-between items-center py-2 px-4 w-full md:w-[85%] mt-10 md:mt-20  mx-auto'>
      <AuroraBg />
      <div
        className="relative z-10 flex flex-col justify-center items-start w-full md:w-[85%]  h-full mx-auto "
      >
        <h2 className='text-4xl md:text-5xl text-[var(--primary)] font-bold tracking-wide'>
          INDUSTRIAL
        </h2>
        <h2 className='text-3xl md:text-5xl mt-2 font-bold tracking-wide'>
          ENGINEERS <Typewriter words={clubLanguages} speed={150} pause={1500} />
        </h2>
        <p className='text-sm w-[90%] md:text-lg md:w-[50%] mt-6 text-[var(--muted-foreground)]'>
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
        <Link to="rooms/">
          <Button size="lg" className='mt-10 px-8 py-3 mx-auto md:mx-0 text-base font-semibold tracking-wide'>
            Explore Your Space
          </Button>
        </Link>
        
      </div>
    </div>
  )
}

export default HomePage
