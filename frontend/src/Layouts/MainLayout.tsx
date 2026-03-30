import {Outlet} from 'react-router-dom'
import Footer from '@/MyComponents/Footer'
import Navbar from '@/MyComponents/Navbar'
import { Toaster } from 'sonner'

const MainLayout = () => {
  return (
    <>
    <Footer />
    <Navbar />
    <main>
        <Outlet />
        <Toaster position='bottom-right' />
    </main>
    </>
  )
}

export default MainLayout