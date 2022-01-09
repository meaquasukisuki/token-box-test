import { useCallback, useEffect,useState } from 'react'

import { provider } from 'web3-core'

import { minimumRequiredApprovalQuantity } from 'constants/approvals'
import useWallet from 'hooks/useWallet'
import { approve } from 'utils'

import useAllowance from './useAllowance'

const useApproval = (
  spenderAddress?: string,
  onTxHash?: (txHash: string) => void,
  tokenContract?:any
) => {
  const allowance = useAllowance(spenderAddress,tokenContract)
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  const {
    account,
    ethereum,
  }: { account: string | null | undefined; ethereum?: provider } = useWallet()
  
  const handleApprove = useCallback(async () => {
    if (!ethereum || !account || !spenderAddress) {
      return
    }
    try {
      setIsApproving(true)
      const result = await approve(
        account,
        spenderAddress,
        ethereum,
        onTxHash,
        tokenContract
      )
      setIsApproved(result)
      setIsApproving(false)
    } catch (e) {
      setIsApproving(false)
      return false
    }
  }, [
    account,
    ethereum,
    onTxHash,
    setIsApproved,
    setIsApproving,
    spenderAddress,
  ])

  useEffect(() => {
    if (allowance?.isGreaterThan(minimumRequiredApprovalQuantity)) {      
      setIsApproved(true)
      return
    }
    else {
      setIsApproved(false)
    }
  }, [allowance, setIsApproved])

  return {
    isApproved,
    isApproving,
    onApprove: handleApprove,
  }
}

export default useApproval
