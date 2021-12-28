import React, { useState } from 'react'

import useWallet from 'hooks/useWallet'
import {
  ChainData,
  MAINNET_CHAIN_DATA,
  POLYGON_CHAIN_DATA,
  TEST_POLYGON_CHAIN_DATA,
} from 'utils/connectors'

import { ChainDataContext } from '.'

const ChainIdProvider: React.FC = ({ children }) => {
  const [chain, setChain] = useState<ChainData>(MAINNET_CHAIN_DATA)
  const { account, ethereum, isMetamaskConnected } = useWallet()

  const setMainnet = () => {
    setChain(MAINNET_CHAIN_DATA)
    if (isMetamaskConnected)
      ethereum?.send('wallet_switchEthereumChain', [
        { chainId: '0x1' },
        account,
      ])
  }

  const setPolygon = () => {
    setChain(POLYGON_CHAIN_DATA)
    if (isMetamaskConnected)
      ethereum?.send('wallet_addEthereumChain', [
        {
          chainId: '0x89',
          chainName: 'Polygon',
          nativeCurrency: {
            name: 'Matic',
            symbol: 'MATIC',
            decimals: 18,
          },
          rpcUrls: ['https://rpc-mainnet.maticvigil.com'],
          blockExplorerUrls: ['https://polygonscan.com/'],
        },
        account,
      ])
  }

  const setTestPolygon = () => {
    setChain(TEST_POLYGON_CHAIN_DATA)
    if (isMetamaskConnected) {
      ethereum?.send('wallet_switchEthereumChain',[
        { chainId: '0x539',
          // chainName: 'local',
          // rpcUrls: ['http://127.0.0.1:8545'],
        },
        account
      ])
    }

    // ethereum?.send('wallet_addEthereumChain', [
    //   {
    //     chainId: '0x539',
    //     chainName: 'TestPolygon',
    //     nativeCurrency: {
    //       name: 'Matic',
    //       symbol: 'MATIC',
    //       decimals: 18,
    //     },
    //     rpcUrls: ['https://polygon-mainnet.g.alchemy.com/v2/0D91hw9OzGdONXUqsomQFnrArD1HOuX7'],
    //     blockExplorerUrls: ['https://polygonscan.com/'],
    //   },
    //   account,
    // ])
  }

  return (
    <ChainDataContext.Provider
      value={{
        chain,
        setMainnet,
        setPolygon,
        setTestPolygon
      }}
    >
      {children}
    </ChainDataContext.Provider>
  )
}

export default ChainIdProvider
