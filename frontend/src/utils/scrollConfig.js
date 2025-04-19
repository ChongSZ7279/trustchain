export const SCROLL_CONFIG = {
  NETWORK: {
    CHAIN_ID: 534351,
    NAME: "Scroll Sepolia",
    SYMBOL: "ETH",
    DECIMALS: 18,
    RPC_URL: "https://sepolia-rpc.scroll.io",
    BLOCK_EXPLORER_URL: "https://sepolia.scrollscan.com",
    CURRENCY: {
      NAME: "Scroll Sepolia ETH",
      SYMBOL: "ETH",
      DECIMALS: 18
    }
  },
  BRIDGE: {
    URL: 'https://scroll.io/bridge'
  },
  FAUCET: {
    URL: 'https://sepolia.scrollscan.com/faucet'
  }
};

export const addScrollNetwork = async () => {
  try {
    console.log('Adding Scroll network with config:', SCROLL_CONFIG);
    
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${SCROLL_CONFIG.NETWORK.CHAIN_ID.toString(16)}`,
          chainName: SCROLL_CONFIG.NETWORK.NAME,
          nativeCurrency: SCROLL_CONFIG.NETWORK.CURRENCY,
          rpcUrls: [SCROLL_CONFIG.NETWORK.RPC_URL],
          blockExplorerUrls: [SCROLL_CONFIG.NETWORK.BLOCK_EXPLORER_URL]
        }
      ]
    });

    console.log('Successfully added Scroll network');
    return true;
  } catch (error) {
    console.error('Error adding Scroll network:', error);
    return false;
  }
}; 