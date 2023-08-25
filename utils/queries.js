import { BigNumber, ethers } from 'ethers'
import { contract, tokenContract } from './contract'
import { toEth } from './ether-utils'
import { UNI, WETH } from './SupportedCoins'
import ERC20 from '../ABI/ERC20.json'

export async function swapEthToToken(tokenName, amount) {
  try {
    let tx = { value: toWei(amount) }

    const contractObj = await contract()
    const data = await contractObj.swapEthToToken(tokenName, tx)

    const receipt = await data.wait()
    return receipt
  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function hasValidAllowance(owner, tokenName, amount) {
  try {
    const contractObj = await contract()
    const address = await contractObj.getTokenAddress(tokenName)

    const tokenContractObj = await tokenContract(address)
    const data = await tokenContractObj.allowance(
      owner,
      process.env.NEXT_PUBLIC_SIMPLE_SWAP,
    )

    const result = BigNumber.from(data.toString()).gte(
      BigNumber.from(toWei(amount)),
    )

    return result
  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function swapTokenToEth(tokenName, amount) {
  try {
    const contractObj = await contract()
    const data = await contractObj.swapTokenToEth(tokenName, toWei(amount))

    const receipt = await data.wait()
    return receipt
  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function swapTokenToToken(srcToken, destToken, amount) {
  try {
    const contractObj = await contract()
    const data = await contractObj.swapTokenToToken(
      srcToken,
      destToken,
      toWei(amount),
    )

    const receipt = await data.wait()
    return receipt
  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function getTokenBalance(tokenName, address) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contract = new ethers.Contract(getTokenAddress(tokenName), ERC20, provider);
  return contract.balanceOf(address);
}

export function getTokenAddress(tokenName) {
  switch (tokenName) {
    case WETH:
      return process.env.NEXT_PUBLIC_WETH_TOKEN
    case UNI:
      return process.env.NEXT_PUBLIC_UNI_TOKEN
    default:
      return undefined
  }
}

export async function increaseAllowance(tokenName, amount) {
  try {
    const contractObj = await contract()
    const address = await contractObj.getTokenAddress(tokenName)

    const tokenContractObj = await tokenContract(address)
    const data = await tokenContractObj.approve(
      process.env.SIMPLE_SWAP,
      toWei(amount),
    )

    const receipt = await data.wait()
    return receipt
  } catch (e) {
    return parseErrorMsg(e)
  }
}

function toWei(amount) {
  const toWei = ethers.utils.parseUnits(amount.toString())
  return toWei.toString()
}

function parseErrorMsg(e) {
  const json = JSON.parse(JSON.stringify(e))
  return json?.reason || json?.error?.message
}
