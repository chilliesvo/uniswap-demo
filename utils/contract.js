import { ethers } from 'ethers'
import SimpleTokenSwap from '../ABI/SimpleTokenSwap.json'
import ERC20ABI from '../ABI/ERC20.json'

export const tokenContract = async address => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const { ethereum } = window

  if (ethereum) {
    const signer = provider.getSigner()
    const contractReader = new ethers.Contract(address, ERC20ABI, signer)
    return contractReader
  }
}

export const dexContract = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const { ethereum } = window

  if (ethereum) {
    const signer = provider.getSigner()
    const contractReader = new ethers.Contract(
      process.env.NEXT_PUBLIC_SIMPLE_SWAP,
      SimpleTokenSwap,
      signer,
    )

    return contractReader
  }
}
