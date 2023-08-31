import axios from 'axios';
import queryString from 'query-string';
import { ethers } from 'ethers';
import { OX_API, STANDARD } from '../../utils/SupportedTransactions';
import router02 from '../../ABI/router02.json';

export const ROUTER = {
    uniswapV201: process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER_1,
    uniswapV202: process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER_2
}

export const getQuote = async (sellToken, buyToken, sellAmount, TransactionType) => {
    const fSellAmount = ethers.utils.parseUnits(sellAmount.toString(), 18);
    if (TransactionType === OX_API) {
        const query = queryString.stringify({
            sellToken: sellToken,
            buyToken: buyToken,
            sellAmount: fSellAmount,
        });
        const res = await axios.get('https://goerli.api.0x.org/swap/v1/quote?' + query, {
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "0x-api-key": "c9819820-eb0f-411b-9b20-3a249e5d2aa2"
            }
        })
        return res.data
    } else if (TransactionType === STANDARD) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const contract = new ethers.Contract(process.env.NEXT_PUBLIC_UNISWAP_V2_ROUTER_2, router02, provider);
        const amountOut = await contract.getAmountsOut(fSellAmount, [sellToken, buyToken]);
        return { sellTokenAddress: sellToken, buyTokenAddress: buyToken, sellAmount: sellAmount, buyAmount: amountOut[1].toString() }
    }
}


