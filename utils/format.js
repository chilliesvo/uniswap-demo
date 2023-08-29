export const formatUnits = (value) => {
    return Math.round(ethers.utils.formatUnits(value, 18) * 100000) / 100000;
};