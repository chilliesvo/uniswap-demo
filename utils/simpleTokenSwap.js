import { ethers } from 'ethers';
import SimpleTokenSwap from '../ABI/SimpleTokenSwap.json';

const CONTRACT_ADDRESS = process.env.SIMPLE_SWAP;

export const getSimpleSwapContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SimpleTokenSwap, signer);
    return contract;
}