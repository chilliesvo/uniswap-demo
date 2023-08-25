import Footer from '../components/Footer'
import Header from '../components/Header'
import SwapComponent from '../components/SwapComponent'

export default function Home() {
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center' style={{ background: 'linear-gradient(to bottom, #252e4d, #090b19)' }}>
      <Header />
      <SwapComponent />
      {/* <Footer /> */}
    </div>
  )
}
