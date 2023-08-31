export const ETH = { name: 'Ethereum', symbol: 'ETH', address: process.env.NEXT_PUBLIC_NATIVE }
export const UNI = { name: 'Uniswap', symbol: 'UNI', address: process.env.NEXT_PUBLIC_UNI_TOKEN }
export const WETH = { name: 'Wrapped Ether', symbol: 'WETH', address: process.env.NEXT_PUBLIC_WETH_TOKEN }
export const DEFAULT_VALUE = 'Select a token'

const tokens = [ETH, UNI, WETH, DEFAULT_VALUE]

export function getTokenAddress(tokenName) {
    const token = tokens.find(token => token.name === tokenName)
    return token.address
}