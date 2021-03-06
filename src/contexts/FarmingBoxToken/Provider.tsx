import React, { useCallback, useState } from 'react'

import { provider } from 'web3-core'

import ConfirmTransactionModal, {
  TransactionStatusType,
} from 'components/ConfirmTransactionModal'
import {
  farmBoxTokenAddress,
  quickSwapRouterAddress,
  uniswapBoxLpTokenAddress,
  uniswapRouterAddress,
} from 'constants/ethContractAddresses'
import useApproval from 'hooks/useApproval'
import useTransactionWatcher from 'hooks/useTransactionWatcher'
import useWallet from 'hooks/useWallet'
import {
  claimEarnedIndexLpReward,
  farmEndTime,  
  stakeUniswapEthDpiLpTokens,
  unstakeAndClaimEarnedIndexLpReward,
  unstakeUniswapEthDpiLpTokens } from 'index-sdk/stake'
import {claimEarnedBoxTokenReward, getBoxTokenContract, getBoxTokenFarmContract, getLPBoxTokenContract, getUSDCTokenPolygonContract, stakeBoxLpTokens, stakeEth2xLeverageLpTokens, unstakeAndHarvest, unStakeLpBox} from 'index-sdk/boxStaking';
import BigNumber from 'utils/bignumber'
import { waitTransaction } from 'utils/index'
import Context from './Context'

const Provider: React.FC = ({ children }) => {
    const [confirmTxModalIsOpen, setConfirmTxModalIsOpen] = useState(false)
  
    const {
      transactionId,
      transactionStatus,
      onSetTransactionStatus,
      onSetTransactionId,
    } = useTransactionWatcher()
    const { account, ethereum } = useWallet()

    const { isApproved:isBoxApproved, isApproving:isBoxApproving, onApprove:onBoxApprove } = useApproval(
      farmBoxTokenAddress,
      () => setConfirmTxModalIsOpen(false),
      getBoxTokenContract(ethereum)
    )

    const { isApproved:isLPBoxApproved, isApproving:isLPBoxApproving, onApprove:onLPBoxApprove } = useApproval(
      farmBoxTokenAddress,
      () => setConfirmTxModalIsOpen(false),
      getLPBoxTokenContract(ethereum)
    )

    const { isApproved:isUSDCTokenApproved, isApproving:isUSDCTokenApproving, onApprove:onUSDCTokenApprove } = useApproval(
      farmBoxTokenAddress,
      () => setConfirmTxModalIsOpen(false),
      getUSDCTokenPolygonContract(ethereum)
    )
  
    const { isApproved:isBoxApprovedToQuickSwap, isApproving:isBoxApprovingToQuickSwap, onApprove:onBoxApproveToQuickSwap } = useApproval(
      quickSwapRouterAddress,
      () => setConfirmTxModalIsOpen(false),
      getBoxTokenContract(ethereum)
    )

    const { isApproved:isUSDCTokenApprovedToQuickSwap, isApproving:isUSDCTokenApprovingToQuickSwap, onApprove:onUSDCTokenApproveToQuickSwap } = useApproval(
      quickSwapRouterAddress,
      () => setConfirmTxModalIsOpen(false),
      getUSDCTokenPolygonContract(ethereum)
    )
  
    const handleBoxApprove = useCallback(() => {
      setConfirmTxModalIsOpen(true)
      onBoxApprove()
    }, [onBoxApprove, setConfirmTxModalIsOpen])

    const handleUSDCTokenApprove = useCallback(() => {
      setConfirmTxModalIsOpen(true)
      onUSDCTokenApprove()
    }, [onUSDCTokenApprove, setConfirmTxModalIsOpen])

    const handleBoxLPApprove = useCallback(() => {
      setConfirmTxModalIsOpen(true)
      onLPBoxApprove()
    }, [onLPBoxApprove, setConfirmTxModalIsOpen])
  
    const handleStake = useCallback(
      async (amount: string) => {
        if (!ethereum || !account || !amount || new BigNumber(amount).lte(0))
          return
  
        setConfirmTxModalIsOpen(true)
        onSetTransactionStatus(TransactionStatusType.IS_APPROVING)
  
        const bigStakeQuantity = new BigNumber(amount).multipliedBy(
          new BigNumber(10).pow(18)
        )
        const transactionId = await stakeBoxLpTokens(
          ethereum as provider,
          account,
          bigStakeQuantity
        )
  
        if (!transactionId) {
          onSetTransactionStatus(TransactionStatusType.IS_FAILED)
          return
        }
  
        onSetTransactionId(transactionId)
        onSetTransactionStatus(TransactionStatusType.IS_PENDING)
  
        const success = await waitTransaction(ethereum as provider, transactionId)
  
        if (success) {
          onSetTransactionStatus(TransactionStatusType.IS_COMPLETED)
        } else {
          onSetTransactionStatus(TransactionStatusType.IS_FAILED)
        }
      },
      [
        ethereum,
        account,
        setConfirmTxModalIsOpen,
        onSetTransactionId,
        onSetTransactionStatus,
      ]
    )

    const handleUnstake = useCallback(
      async (amount: string) => {
        if (!ethereum || !account || !amount || new BigNumber(amount).lte(0))
          return
  
        setConfirmTxModalIsOpen(true)
        onSetTransactionStatus(TransactionStatusType.IS_APPROVING)
  
        const bigUnstakeQuantity = new BigNumber(amount).multipliedBy(
          new BigNumber(10).pow(18)
        )
        const transactionId = await unStakeLpBox(
          ethereum as provider,
          bigUnstakeQuantity,
          account,
        )
  
        if (!transactionId) {
          onSetTransactionStatus(TransactionStatusType.IS_FAILED)
          return
        }
  
        onSetTransactionId(transactionId)
        onSetTransactionStatus(TransactionStatusType.IS_PENDING)
  
        const success = await waitTransaction(ethereum as provider, transactionId)
  
        if (success) {
          onSetTransactionStatus(TransactionStatusType.IS_COMPLETED)
        } else {
          onSetTransactionStatus(TransactionStatusType.IS_FAILED)
        }
      },
      [
        ethereum,
        account,
        setConfirmTxModalIsOpen,
        onSetTransactionId,
        onSetTransactionStatus,
      ]
    )
  
    const handleHarvest = useCallback(async () => {
      if (!ethereum || !account) return
  
      setConfirmTxModalIsOpen(true)
      onSetTransactionStatus(TransactionStatusType.IS_APPROVING)
  
      const transactionId = await claimEarnedBoxTokenReward(
        ethereum as provider,
        account
      )
  
      if (!transactionId) {
        onSetTransactionStatus(TransactionStatusType.IS_FAILED)
        return
      }
  
      onSetTransactionId(transactionId)
      onSetTransactionStatus(TransactionStatusType.IS_PENDING)
  
      const success = await waitTransaction(ethereum as provider, transactionId)
  
      if (success) {
        onSetTransactionStatus(TransactionStatusType.IS_COMPLETED)
      } else {
        onSetTransactionStatus(TransactionStatusType.IS_FAILED)
      }
    }, [
      ethereum,
      account,
      setConfirmTxModalIsOpen,
      onSetTransactionId,
      onSetTransactionStatus,
    ])
  
    // const handleUnstakeAndHarvest = () => {
    //   console.log("handleUnstakeAndHarvest");
    // }

    const handleUnstakeAndHarvest = useCallback(async (
      amount: string
    ) => {
      if (!ethereum || !account || !amount || new BigNumber(amount).lte(0))
        return
  
      setConfirmTxModalIsOpen(true)
      onSetTransactionStatus(TransactionStatusType.IS_APPROVING)

      const bigUnstakeQuantity = new BigNumber(amount).multipliedBy(
        new BigNumber(10).pow(18)
      )

      const transactionId = await unstakeAndHarvest(
        ethereum as provider,
        bigUnstakeQuantity,
        account
      )
  
      if (!transactionId) {
        onSetTransactionStatus(TransactionStatusType.IS_FAILED)
        return
      }
  
      onSetTransactionId(transactionId)
      onSetTransactionStatus(TransactionStatusType.IS_PENDING)
  
      const success = await waitTransaction(ethereum as provider, transactionId)
  
      if (success) {
        onSetTransactionStatus(TransactionStatusType.IS_COMPLETED)
      } else {
        onSetTransactionStatus(TransactionStatusType.IS_FAILED)
      }
    }, [
      ethereum,
      account,
      setConfirmTxModalIsOpen,
      onSetTransactionId,
      onSetTransactionStatus,
    ])
  
    const currentTime = Date.now()
    const isPoolActive = new BigNumber(farmEndTime).isGreaterThan(
      new BigNumber(currentTime)
    )

    const getPoolAPR = async () => {
      const stakingContract = getBoxTokenFarmContract(ethereum)
      const boxTokenContract = getBoxTokenContract(ethereum);
      const boxLpTokenContract = getLPBoxTokenContract(ethereum)
      // const eth2XLeverageTokenContract = getEth2XLeverageTokenContract(provider);
      // const eth2USDCLpTokenContract = getEth2USDCLPContract(provider)
      const annualSeconds = new BigNumber(365).times(24).times(3600)
      let annualBox = new BigNumber(0)
      let sushiPerSecond = await stakingContract.methods.sushiPerSecond().call()
      
      const ethPoolInfo = stakingContract.methods.poolInfo(0).call()
      const boxPoolInfo = stakingContract.methods.poolInfo(1).call()
      const ethAllocPoint = ethPoolInfo?.allocPoint
      const boxAllocPoint = boxPoolInfo?.allocPoint
      const percent = new BigNumber(boxAllocPoint)
      .dividedBy(new BigNumber(ethAllocPoint).plus(new BigNumber(boxAllocPoint)))

      annualBox = annualSeconds.times(sushiPerSecond).times(percent)
      
      const reserves = boxLpTokenContract.methods.getReserves().call()
      
    }
  
    return (
      <Context.Provider
        value={{
          isBoxApproved,
          isLPBoxApproved,
          isUSDCTokenApproved,
          isBoxApproving,
          isUSDCTokenApproving,
          isLPBoxApproving,
          isPoolActive,
          onBoxApprove:handleBoxApprove,
          onLPBoxApprove:handleBoxLPApprove,
          onUSDCApprove: handleUSDCTokenApprove,
          onHarvest: handleHarvest,
          onUnstakeAndHarvest: handleUnstakeAndHarvest,
          onStake: handleStake,
          onUnstake: handleUnstake,
          isBoxApprovedToQuickSwap,
          isUSDCTokenApprovedToQuickSwap,
          isBoxApprovingToQuickSwap,
          isUSDCTokenApprovingToQuickSwap,
          onBoxApproveToQuickSwap,
          onUSDCTokenApproveToQuickSwap,
          // getPoolAPR
        }}
      >
        {children}
        <ConfirmTransactionModal
          isOpen={confirmTxModalIsOpen}
          transactionId={transactionId}
          transactionMiningStatus={transactionStatus}
          onDismiss={() => {
            setConfirmTxModalIsOpen(false)
            onSetTransactionStatus(undefined)
          }}
        />
      </Context.Provider>
    )
}

export default Provider;