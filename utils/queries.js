import { BigNumber, ethers } from 'ethers'
import { simpleSwapContract, tokenContract, uniswapV2Contract } from './contract'
import { UNI, WETH, getTokenAddress } from './SupportedCoins'
import ERC20ABI from '../ABI/ERC20.json'
import { OX_API, STANDARD } from './SupportedTransactions'
import { ROUTER } from '../pages/api/quote'

export async function swapEthToToken(tokenName, amount) {
  try {
    let tx = { value: toWei(amount) }

    const contractObj = await simpeContract()
    const data = await contractObj.swapEthToToken(tokenName, tx)

    const receipt = await data.wait()
    return receipt
  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function hasValidAllowance(owner, tokenName, amount, transactionType) {
  try {
    const address = getTokenAddress(tokenName)

    const tokenContractObj = await tokenContract(address)
    const data = await tokenContractObj.allowance(
      owner,
      transactionType === STANDARD ? ROUTER.uniswapV202 : process.env.NEXT_PUBLIC_SIMPLE_SWAP,
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
    const contractObj = await simpeContract()
    const data = await contractObj.swapTokenToEth(tokenName, toWei(amount))

    const receipt = await data.wait()
    return receipt
  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function swapTokenToToken(quote, transactionType, owner) {
  const { sellTokenAddress, buyTokenAddress, sellAmount, allowanceTarget, to, data: swapData } = quote

  try {
    if (transactionType === OX_API) {
      const contractObj = await simpleSwapContract()
      const data = await contractObj.fillQuote(
        sellTokenAddress,
        buyTokenAddress,
        sellAmount,
        allowanceTarget,
        to,
        swapData,
        {
          value: sellTokenAddress.toLowerCase() === WETH.address.toLowerCase() ? sellAmount.toString() : 0,
        }
      )
      const receipt = await data.wait()
      return receipt
    } else if (transactionType === STANDARD) {

      const contractObj = await uniswapV2Contract()
      const amountIn = ethers.utils.parseEther(sellAmount)
      const amountOut = 0
      const path = [sellTokenAddress, buyTokenAddress]
      const to = owner
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20
      const params = [amountIn, amountOut, path, to, deadline]
      const data = await contractObj.swapExactTokensForTokens(...params)
      const receipt = await data.wait()
      return receipt
    } else {
      return
    }

  } catch (e) {
    return parseErrorMsg(e)
  }
}

export async function getTokenBalance(tokenName, address) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const contract = new ethers.Contract(getTokenAddress(tokenName), ERC20ABI, provider);
  return contract.balanceOf(address);
}

export async function increaseAllowance(tokenName, amount, transactionType) {
  try {
    const address = getTokenAddress(tokenName)
    const tokenContractObj = await tokenContract(address)
    const data = await tokenContractObj.approve(
      transactionType === STANDARD ? ROUTER.uniswapV202 : process.env.NEXT_PUBLIC_SIMPLE_SWAP,
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
