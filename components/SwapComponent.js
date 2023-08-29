import React, { useEffect, useState, useRef } from 'react'
import {
  getTokenAddress,
  hasValidAllowance,
  increaseAllowance,
  swapEthToToken,
  swapTokenToEth,
  swapTokenToToken,
} from '../utils/queries'
import { getQuote } from '../pages/api/quote';
import { ethers } from 'ethers';

import { CogIcon, ArrowSmDownIcon } from '@heroicons/react/outline'
import SwapField from './SwapField'
import TransactionStatus from './TransactionStatus'
import toast, { Toaster } from 'react-hot-toast'
import { DEFAULT_VALUE, ETH, UNI, WETH } from '../utils/SupportedCoins'
import { useAccount } from 'wagmi'
import { formatUnits } from 'ethers/lib/utils';

const SwapComponent = () => {
  const [srcToken, setSrcToken] = useState(WETH.name)
  const [destToken, setDestToken] = useState(DEFAULT_VALUE)

  const [inputValue, setInputValue] = useState()
  const [outputValue, setOutputValue] = useState()

  const inputValueRef = useRef()
  const outputValueRef = useRef()

  const isReversed = useRef(false)

  const INCREASE_ALLOWANCE = 'Increase allowance'
  const ENTER_AMOUNT = 'Enter an amount'
  const CONNECT_WALLET = 'Connect wallet'
  const SWAP = 'Swap'

  const srcTokenObj = {
    id: 'srcToken',
    value: inputValue,
    setValue: setInputValue,
    defaultValue: srcToken,
    ignoreValue: destToken,
    setToken: setSrcToken,
  }

  const destTokenObj = {
    id: 'destToken',
    value: outputValue,
    setValue: setOutputValue,
    defaultValue: destToken,
    ignoreValue: srcToken,
    setToken: setDestToken,
  }

  const [srcTokenComp, setSrcTokenComp] = useState()
  const [destTokenComp, setDestTokenComp] = useState()

  const [swapBtnText, setSwapBtnText] = useState(ENTER_AMOUNT)
  const [txPending, setTxPending] = useState(false)

  const notifyError = msg => toast.error(msg, { duration: 6000 })
  const notifySuccess = () => toast.success('Transaction completed.')

  const { address } = useAccount()

  useEffect(() => {
    // Handling the text of the submit button

    if (!address) setSwapBtnText(CONNECT_WALLET)
    else if (!inputValue || !outputValue) setSwapBtnText(ENTER_AMOUNT)
    else setSwapBtnText(SWAP)
  }, [inputValue, outputValue, address])

  useEffect(() => {
    if (
      document.activeElement !== outputValueRef.current &&
      document.activeElement.ariaLabel !== 'srcToken' &&
      !isReversed.current
    )
      populateOutputValue(inputValue)

    setSrcTokenComp(<SwapField obj={srcTokenObj} ref={inputValueRef} />)

    if (inputValue?.length === 0) setOutputValue('')
  }, [inputValue, destToken])

  useEffect(() => {
    if (
      document.activeElement !== inputValueRef.current &&
      document.activeElement.ariaLabel !== 'destToken' &&
      !isReversed.current
    )
      populateInputValue(outputValue)

    setDestTokenComp(<SwapField obj={destTokenObj} ref={outputValueRef} />)

    if (outputValue?.length === 0) setInputValue('')

    // Resetting the isReversed value if its set
    if (isReversed.current) isReversed.current = false
  }, [outputValue, srcToken])

  async function handleSwap() {
    if (srcToken === ETH.name && destToken !== ETH.name) {
      performSwap()
    } else {
      // Check whether there is allowance when the swap deals with tokenToEth/tokenToToken
      setTxPending(true)
      const result = await hasValidAllowance(address, srcToken, inputValue)
      setTxPending(false)

      if (result) performSwap()
      else handleInsufficientAllowance()
    }
  }

  async function handleIncreaseAllowance() {
    // Increase the allowance
    setTxPending(true)
    await increaseAllowance(srcToken, inputValue)
    setTxPending(false)

    // Set the swapbtn to "Swap" again
    setSwapBtnText(SWAP)
  }

  function handleReverseExchange(e) {
    // Setting the isReversed value to prevent the input/output values
    // being calculated in their respective side - effects
    isReversed.current = true

    // 1. Swap tokens (srcToken <-> destToken)
    // 2. Swap values (inputValue <-> outputValue)

    setInputValue(outputValue)
    setOutputValue(inputValue)

    setSrcToken(destToken)
    setDestToken(srcToken)
  }

  function getSwapBtnClassName() {
    let className = 'p-4 w-full my-2 rounded-xl'
    className +=
      swapBtnText === ENTER_AMOUNT || swapBtnText === CONNECT_WALLET
        ? ' text-zinc-400 bg-zinc-800 pointer-events-none'
        : ' bg-blue-700'
    className += swapBtnText === INCREASE_ALLOWANCE ? ' bg-yellow-600' : ''
    return className
  }

  async function populateOutputValue() {
    if (
      destToken === DEFAULT_VALUE ||
      srcToken === DEFAULT_VALUE ||
      inputValue === '0'
    ) return

    let outValue;
    try {
      switch (true) {
        case srcToken === WETH.name && destToken === UNI.name:
          outValue = (await getQuote({
            sellToken: WETH.address,
            buyToken: UNI.address,
            sellAmount: ethers.utils.parseUnits(inputValue.toString(), 18),
          })).buyAmount;
          setOutputValue(formatUnits(outValue))
          break
        case srcToken === UNI.name && destToken === WETH.name:
          outValue = (await getQuote({
            sellToken: UNI.address,
            buyToken: WETH.address,
            sellAmount: ethers.utils.parseUnits(inputValue.toString(), 18),
          })).buyAmount;
          setOutputValue(formatUnits(outValue))
          break
        default:
          setOutputValue('0')
      }
    } catch (error) {
      console.log('error :>> ', error);
      setOutputValue('0')
    }
  }

  async function populateInputValue() {
    if (
      destToken === DEFAULT_VALUE ||
      srcToken === DEFAULT_VALUE ||
      outputValue === '0'
    ) return

    let outValue;
    try {
      switch (true) {
        case destToken === UNI.name && srcToken === WETH.name:
          outValue = (await getQuote({
            sellToken: UNI.address,
            buyToken: WETH.address,
            sellAmount: ethers.utils.parseUnits(outputValue.toString(), 18),
          })).buyAmount;

          setInputValue(formatUnits(outValue))
          break
        case destToken === WETH.name && srcToken === UNI.name:
          outValue = (await getQuote({
            sellToken: UNI.address,
            buyToken: WETH.address,
            sellAmount: ethers.utils.parseUnits(outputValue.toString(), 18),
          })).buyAmount;
          setInputValue(formatUnits(outValue))
          break
        default:
          setOutputValue('0')
      }
    } catch (error) {
      console.log('error :>> ', error);
      setInputValue('0')
    }
  }

  async function performSwap() {
    setTxPending(true)

    let receipt
    const quote = await getQuote({
      sellToken: getTokenAddress(srcToken),
      buyToken: getTokenAddress(destToken),
      sellAmount: ethers.utils.parseUnits(inputValue.toString(), 18),
    })
    const { sellTokenAddress, buyTokenAddress, sellAmount, allowanceTarget, to, data: swapData } = quote
    receipt = await swapTokenToToken(sellTokenAddress, buyTokenAddress, sellAmount, allowanceTarget, to, swapData)
    setTxPending(false)

    if (receipt && !receipt.hasOwnProperty('transactionHash'))
      notifyError(receipt)
    else notifySuccess()
  }

  function handleInsufficientAllowance() {
    notifyError(
      "Insufficient allowance. Click 'Increase allowance' to increase it.",
    )
    setSwapBtnText(INCREASE_ALLOWANCE)
  }

  return (
    <div className='bg-zinc-900 w-[35%] p-4 px-6 rounded-xl'>
      <div className='flex items-center justify-between py-4 px-1'>
        <p>Swap</p>
        <CogIcon className='h-6' />
      </div>
      <div className='relative bg-[#212429] p-4 py-6 rounded-xl mb-2 border-[2px] border-transparent hover:border-zinc-600'>
        {srcTokenComp}

        <ArrowSmDownIcon
          className='absolute left-1/2 -translate-x-1/2 -bottom-6 h-10 p-1 bg-[#212429] border-4 border-zinc-900 text-zinc-300 rounded-xl cursor-pointer hover:scale-110'
          onClick={handleReverseExchange}
        />
      </div>

      <div className='bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600'>
        {destTokenComp}
      </div>

      <button
        className={getSwapBtnClassName()}
        onClick={() => {
          if (swapBtnText === INCREASE_ALLOWANCE) handleIncreaseAllowance()
          else if (swapBtnText === SWAP) handleSwap()
        }}
      >
        {swapBtnText}
      </button>

      {txPending && <TransactionStatus />}

      <Toaster />
    </div>
  )
}

export default SwapComponent
