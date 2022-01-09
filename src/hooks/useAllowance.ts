import { useCallback, useEffect, useState } from 'react'

import { provider } from 'web3-core'

import useWallet from 'hooks/useWallet'
import { getAllowance } from 'utils'
import BigNumber from 'utils/bignumber'
import { Contract } from 'ethers'

const useAllowance = (spenderAddress?: string, tokenContract?: Contract) => {
  const [allowance, setAllowance] = useState<BigNumber>()

  const {
    account,
    ethereum,
  }: { account: string | null | undefined; ethereum?: provider } = useWallet()

  const fetchAllowance = useCallback(
    async (userAddress: string, provider: provider) => {
      if (!spenderAddress || ! provider) {
        return
      }

      const allowance = await getAllowance(
        userAddress,
        spenderAddress,
        provider,
        tokenContract
      )
      setAllowance(new BigNumber(allowance))
    },
    [setAllowance, spenderAddress, account, ethereum]
  )

  useEffect(() => {
    if (!account || !ethereum || !spenderAddress) {
      return
    }

    fetchAllowance(account, ethereum)

    let refreshInterval = setInterval(
      () => {
        fetchAllowance(account, ethereum)
      },
      10000
    )

    return () => clearInterval(refreshInterval)
  }, [account, ethereum, spenderAddress, fetchAllowance])

  return allowance
}

export default useAllowance
