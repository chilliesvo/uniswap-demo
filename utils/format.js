export const formatUnits = (value) => {
    return Math.round(ethers.utils.formatUnits(value, 18) * 100000) / 100000;
};

export const roundNumber = (value) => {
    return Math.round(value * 100000) / 100000;
};