import axios from 'axios';
import queryString from 'query-string';
import { ethers } from 'ethers';

export const getQuote = async (sellToken, buyToken, sellAmount) => {
    const query = queryString.stringify({
        sellToken: sellToken,
        buyToken: buyToken,
        sellAmount: ethers.utils.parseUnits(sellAmount.toString(), 18),
    });
    const res = await axios.get('https://goerli.api.0x.org/swap/v1/quote?' + query, {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "0x-api-key": "c9819820-eb0f-411b-9b20-3a249e5d2aa2"
        }
    })
    return res.data
}


