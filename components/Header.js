import React, { useEffect, useState } from 'react'
import TokenBalance from './TokenBalance'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import toast, { Toaster } from 'react-hot-toast'
import NavItems from './NavItems'
import { UNI, WETH } from '../utils/SupportedCoins'

const Header = () => {
  const [tokenBalComp, setTokenBalComp] = useState()

  const { address } = useAccount()

  const notifyConnectWallet = () =>
    toast.error('Connect wallet.', { duration: 2000 })

  useEffect(() => {
    setTokenBalComp(
      <>
        <TokenBalance name={WETH.name} walletAddress={address} />
        <TokenBalance name={UNI.name} walletAddress={address} />
      </>,
    )

    if (!address) notifyConnectWallet()
  }, [address])

  return (
    <div className='fixed left-0 top-0 w-full px-8 py-4 flex items-center justify-between'>
      <div className='flex items-center'>
        {/* <img src='./uniswap.png' className='h-12' /> */}
        <NavItems />
      </div>

      <div className='flex items-center'>{tokenBalComp}</div>

      <div className='flex'>
        <ConnectButton className='mx-8' accountStatus={'full'} />
      </div>

      <Toaster />
    </div>
  )
}

export default Header
