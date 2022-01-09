import { useEffect, useState } from 'react'
import Web3 from 'web3'
import ENS, { getEnsAddress } from '@ensdomains/ensjs'
import useWallet from './useWallet'
export function useEnsDomain() {
  const {
    account
  } = useWallet()
  // const { account, library } = useEthers()
  const [ensDomain, setEnsDomain] = useState<string | null>()

  const ethWeb3 = new Web3(
    "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
  )
  const provider = ethWeb3.currentProvider
  
  const ensTest = new ENS({ provider, ensAddress: getEnsAddress('1') })
    
  useEffect(() => {
   (async () => {
     try {
       const res = await ensTest.getName(account)
       setEnsDomain(res?.name)
     } catch (error) {
       console.log(error);
     }
   })()
    return () => {
      
    }
  }, [ensTest,account])

  return ensDomain;
}
