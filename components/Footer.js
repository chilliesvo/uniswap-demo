import React from 'react'
import TokenBalance from './TokenBalance'
import { UNI, WETH } from '../utils/SupportedCoins'

const Footer = () => {
  return (
    <div className='flex fixed bottom-4 left-1/2 -translate-x-1/2'>
      <TokenBalance name={WETH.name} />
      <TokenBalance name={UNI.name} />
    </div>
  )
}

export default Footer
