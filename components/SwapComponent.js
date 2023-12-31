import React, { useEffect, useState, useRef, useCallback } from 'react'
import {
  hasValidAllowance,
  increaseAllowance,
  swapTokenToToken,
} from '../utils/queries'
import { getQuote } from '../pages/api/quote';
import { ethers } from 'ethers';
import { debounce } from 'lodash';

import { CogIcon, ArrowSmDownIcon } from '@heroicons/react/outline'
import SwapField from './SwapField'
import TransactionStatus from './TransactionStatus'
import toast, { Toaster } from 'react-hot-toast'
import { DEFAULT_VALUE, ETH, UNI, WETH, getTokenAddress } from '../utils/SupportedCoins'
import { useAccount } from 'wagmi'
import { formatUnits } from 'ethers/lib/utils';
import { roundNumber } from '../utils/format';
import Setting from './Setting';
import { OX_API, STANDARD } from '../utils/SupportedTransactions';
import { Dropdown } from '@nextui-org/react'

const menuType = [
  { key: STANDARD, name: STANDARD },
  { key: OX_API, name: OX_API },
]

const SwapComponent = () => {
  const [srcToken, setSrcToken] = useState(WETH.name)
  // const [destToken, setDestToken] = useState(DEFAULT_VALUE)
  const [destToken, setDestToken] = useState(UNI.name)

  const [inputValue, setInputValue] = useState()
  const [outputValue, setOutputValue] = useState()

  const [transactionType, setTransactionType] = useState(OX_API)
  const [menuTypes, setMenuTypes] = useState(menuType)

  const setOutput = async (srcToken, destToken, value, isSetOutput) => {
    try {
      const srcAddress = getTokenAddress(srcToken)
      const destAddress = getTokenAddress(destToken)
      const quote = await getQuote(srcAddress, destAddress, value, transactionType);
      const buyAmount = quote.buyAmount
      const fBuyAmount = roundNumber(formatUnits(buyAmount, 18)).toString()
      isSetOutput ? setOutputValue(fBuyAmount) : setInputValue(fBuyAmount);
      const route = transactionType === STANDARD ? "Uniswap V2" : getRoute(quote)
      setRoute(route);
      // setProtocolFee(quote.protocolFee)
    } catch (error) {
      console.log('error', error);
      setOutputValue('0')
      // setProtocolFee('0')
      setRoute('.')
    }
  };

  const debouncedGetOutput = useCallback(debounce(setOutput, 800), [transactionType]);

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
  const [route, setRoute] = useState('.')
  // const [protocolFee, setProtocolFee] = useState('0')

  const [swapBtnText, setSwapBtnText] = useState(ENTER_AMOUNT)
  const [txPending, setTxPending] = useState(false)

  const notifyError = msg => toast.error(msg, { duration: 6000 })
  const notifySuccess = () => toast.success('Transaction completed.')
  const getRoute = (quote) => quote.orders[0].source.replace("_", " ")

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

  useEffect(() => {
    setMenuTypes(menuType)
  }, [])

  async function handleSwap() {
    if (srcToken === ETH.name && destToken !== ETH.name) {
      performSwap()
    } else {
      // Check whether there is allowance when the swap deals with tokenToEth/tokenToToken
      setTxPending(true)
      const result = await hasValidAllowance(address, srcToken, inputValue, transactionType)
      setTxPending(false)

      if (result) performSwap()
      else handleInsufficientAllowance()
    }
  }

  async function handleIncreaseAllowance() {
    // Increase the allowance
    setTxPending(true)
    await increaseAllowance(srcToken, inputValue, transactionType)
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

    debouncedGetOutput(srcToken, destToken, inputValue, true)
  }

  async function populateInputValue() {
    if (
      destToken === DEFAULT_VALUE ||
      srcToken === DEFAULT_VALUE ||
      outputValue === '0'
    ) return

    debouncedGetOutput(destToken, srcToken, outputValue, false)
  }

  async function performSwap() {
    setTxPending(true)

    let receipt
    const quote = await getQuote(
      getTokenAddress(srcToken),
      getTokenAddress(destToken),
      inputValue,
      transactionType
    )
    receipt = await swapTokenToToken(quote, transactionType, address)
    setTxPending(false)

    if (receipt && !receipt.hasOwnProperty('transactionHash')) {
      notifyError(receipt)
    } else {
      window.location.reload()
      notifySuccess()
    }
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
        <div className="text-right">
          {/* <Setting /> */}
        </div>
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

      <div className='bg-[#212429] p-4 py-6 rounded-xl mt-2 border-[2px] border-transparent hover:border-zinc-600'>
        <div className="flex justify-between">
          <div className="text-sm mt-2 ml-2 text-zinc-300">
            <p>Transaction type</p>
          </div>
          <div className="text-sm text-right">
            <Dropdown>
              <Dropdown.Button
                css={{
                  backgroundColor: '#222429',
                }}
              >
                {transactionType}
              </Dropdown.Button>
              <Dropdown.Menu
                aria-label='Dynamic Actions'
                items={menuTypes}
                onAction={key => {
                  setTransactionType(key)
                }}
              >
                {item => (
                  <Dropdown.Item
                    aria-label={transactionType}
                    key={item.key}
                    color={item.key === 'delete' ? 'error' : 'default'}
                  >
                    {item.name}
                  </Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-sm ml-2 text-zinc-300">
            <p>Route</p>
            {/* <p>Fee</p> */}
          </div>
          <div className="text-sm mr-2 text-right">
            <p>{route}</p>
            {/* <p>{protocolFee} ETH</p> */}
          </div>
        </div>
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
