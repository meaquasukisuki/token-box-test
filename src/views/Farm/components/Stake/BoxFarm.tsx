import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { Button, Card, CardContent, Spacer } from 'react-neu'

import numeral from 'numeral'
import styled from 'styled-components'

import indexToken from 'assets/index-token.png'
import Split from 'components/Split'
import useBalances from 'hooks/useBalances'
import useBoxTokenFarm from 'hooks/useBoxTokenFarm'
import useMediaQuery from 'hooks/useMediaQuery'
import useWallet from 'hooks/useWallet'

import BoxStakeModal from './components/BoxStakeModal'
import BoxUnstakeModal from './components/BoxUnstakeModal'
import BoxUnstakeAndHarvestModal from './components/BoxUnstakeAndHarvestModal'
import {  addLiquidity, stakeBoxLpTokens, swapETHForExactTokens } from 'index-sdk/boxStaking'
import BigNumber from 'utils/bignumber'
import { ethToBoxPath, ethToUSDCPath } from 'constants/ethContractAddresses'

const Stake: React.FC = () => {
  const [stakeModalIsOpen, setStakeModalIsOpen] = useState(false)
  const [unstakeModalIsOpen, setUnstakeModalIsOpen] = useState(false)
  const [unstakeAndHarvestModalIsOpen, setUnstakeAndHarvestModalIsOpen] = useState(false)
  const [APR, setAPR] = useState(0)
  const {status,ethereum,account} = useWallet()
  
  const { 
    stakedFarmTwoBalance: stakedBalance, 
    unharvestedFarmTwoBalance,
    uniswapBoxLpBalance,
    stakedBoxLpBalance,
    userStakedBoxLpBalance 
  } = useBalances()

  const {
    isBoxApproved,
    isLPBoxApproved,
    isUSDCTokenApproved,
    isBoxApprovedToQuickSwap,
    isUSDCTokenApprovedToQuickSwap,
    isBoxApproving,
    isUSDCTokenApproving,
    isLPBoxApproving,
    isBoxApprovingToQuickSwap,
    isUSDCTokenApprovingToQuickSwap,
    onBoxApprove,
    onLPBoxApprove,
    onUSDCApprove,
    onUSDCTokenApproveToQuickSwap,
    onBoxApproveToQuickSwap,
    onStake,
    onUnstake,
    onUnstakeAndHarvest,
    onHarvest,
  } = useBoxTokenFarm()
//   const { farmTwoApy } = usePrices()
  const { isMobile } = useMediaQuery()

  const onGetUsdc = async () => {
    await swapETHForExactTokens(
      ethereum,
      account,
      10,
      ethToUSDCPath
    )
  }

  const onGetBox =async () => {
    await swapETHForExactTokens(
      ethereum,
      account,
      10,
      ethToBoxPath
    )
  }

  const onAddLiquidity =async () => {
    await addLiquidity(
      ethereum,
      account
    )
  }

  const handleDismissStakeModal = useCallback(() => {
    setStakeModalIsOpen(false)
  }, [setStakeModalIsOpen])

  const handleDismissUnstakeModal = useCallback(
    () => {
      setUnstakeModalIsOpen(false)
    },
    [setUnstakeModalIsOpen],
  )

  const handleDismissUnstakeAndHarvestModal = useCallback(
    () => {
      setUnstakeAndHarvestModalIsOpen(false)
    },
    [setUnstakeAndHarvestModalIsOpen],
  )

  const handleOnStake = useCallback(
    (amount: string) => {
      onStake(amount)
      handleDismissStakeModal()
    },
    [handleDismissStakeModal, onStake]
  )

  const handleStakeClick = useCallback(() => {
    setStakeModalIsOpen(true)
  }, [setStakeModalIsOpen])

  const handleUnstakeClick = useCallback(
    () => {
      setUnstakeModalIsOpen(true)
    },
    [setUnstakeModalIsOpen],
  )

  const handleUnstakeAndHarvestClick = useCallback(
    () => {
      setUnstakeAndHarvestModalIsOpen(true)
    },
    [setUnstakeAndHarvestModalIsOpen],
  )

  const handleOnUnstake = useCallback(
    (amount: string) => {
      onUnstake(amount)
      handleDismissUnstakeModal()
    },
    [onUnstake,handleDismissUnstakeModal]
  )

  const handleOnUnstakeAndHarvest = useCallback(
    (amount: string) => {
      onUnstakeAndHarvest(amount)
      handleDismissUnstakeAndHarvestModal()
    },
    [
      onUnstakeAndHarvest,
      handleDismissUnstakeAndHarvestModal
    ],
  )

  const StakeButton = useMemo(() => {
    if (status !== 'connected') {
      return <Button disabled full text='Stake' variant='secondary' />
    }
    
    if (!isLPBoxApproved) {
      return (
        <Button
          disabled={isLPBoxApproving}
          full
          onClick={onLPBoxApprove}
          text={!isLPBoxApproving ? 'Approve staking' : 'Approving staking...'}
          variant={
            isLPBoxApproving || status !== 'connected' ? 'secondary' : 'default'
          }
        />
      )
    }

    if (isLPBoxApproved) {
      return <Button full onClick={handleStakeClick} text='Stake' />
    }
  }, [isLPBoxApproved, isLPBoxApproving, status, handleStakeClick, onLPBoxApprove])

  const UnstakeButton = useMemo(() => {
    if (status !== 'connected') {
      return <Button disabled full text='Unstake' variant='secondary' />
    }

    if ((!ethereum || !account || !userStakedBoxLpBalance || userStakedBoxLpBalance.lte(0))) {
      return (
        <Button
          disabled
          full
          text={'Not Staked'}
          variant={
            status !== 'connected' ? 'secondary' : 'default'
          }
        />
      )
    }
    else  {
      return <Button full onClick={handleUnstakeClick} text='Unstake' />
    }
  }, [userStakedBoxLpBalance, status, handleUnstakeClick])

  const UnstakeAndHarvestButton = useMemo(() => {
    if (status !== 'connected') {
      return <Button disabled full text='Unstake' variant='secondary' />
    }
    if ((!ethereum || !account || !userStakedBoxLpBalance || userStakedBoxLpBalance.lte(0))) {
      return (
        <Button
          disabled
          full
          text={'Not Staked'}
          variant={
            status !== 'connected' ? 'secondary' : 'default'
          }
        />
      )
    }
    else  {
      return <Button full onClick={handleUnstakeAndHarvestClick} text='Unstake & Harvest' />
    }

  }, [userStakedBoxLpBalance, status, handleUnstakeAndHarvestClick])

  const ClaimButton = useMemo(() => {
    if (status !== 'connected') {
      return <Button disabled full text='Claim' variant='secondary' />
    }
    return <Button full onClick={onHarvest} text='Harvest' />
  }, [status, onHarvest])

  const formattedStakedBalance = useMemo(() => {
    if (stakedBoxLpBalance !== undefined) {
      return numeral(stakedBoxLpBalance.toString()).format('0.00000a')
    } else {
      return '--'
    }
  }, [stakedBoxLpBalance])

  const formattedEarnedBalance = useMemo(() => {
    if (unharvestedFarmTwoBalance) {
      return numeral(unharvestedFarmTwoBalance.toString()).format('0.00000a')
    } else {
      return '--'
    }
  }, [unharvestedFarmTwoBalance])

  return (
    <>
      <Card>
        <div data-cy='dpi-farm-widget'>
          <CardContent>
            <StyledCardTitleWrapper>
              <StyledHeaderIcon
                src='https://index-dao.s3.amazonaws.com/defi_pulse_index_set.svg'
                alt='DefiPulse Index Logo'
              />
              <Spacer size='md' />
              <StyledLmTitle>
                <StyledCardTitle>Box Token Liquidity Program</StyledCardTitle>
                <Spacer size='sm' />
                <StyledCardSubtitle>
                  Active July 13th, 2021 - August 12th, 2021
                </StyledCardSubtitle>
              </StyledLmTitle>
            </StyledCardTitleWrapper>
            <Spacer />

            <StyledFarmTokensAndApyWrapper>
              <Split>
                <div>
                  <StyledFarmText>
                    {formattedStakedBalance}
                    <StyledTokenIcon
                      alt='box icon'
                      src='https://index-dao.s3.amazonaws.com/eth-dpi.svg'
                    />
                  </StyledFarmText>
                  <StyledSectionLabel>
                    Box LP Tokens
                  </StyledSectionLabel>
                </div>

                <div>
                  <StyledFarmText>{APR.toFixed(2)} % APR</StyledFarmText>
                  <StyledSectionLabel>(Volatile)</StyledSectionLabel>
                </div>

                <div>
                  <StyledFarmText>
                    {formattedEarnedBalance}
                    <StyledTokenIcon
                      src={indexToken}
                      alt='Index token'
                    />
                  </StyledFarmText>
                  <StyledSectionLabel>
                    Unclaimed INDEX in pool
                  </StyledSectionLabel>
                </div>
              </Split>
            </StyledFarmTokensAndApyWrapper>
          </CardContent>
          <StyledCardActions isMobile={isMobile}>
            {StakeButton}
            <Spacer />
            {ClaimButton}
            <Spacer/>
            {UnstakeButton}
            <Spacer />
            {UnstakeAndHarvestButton}

          </StyledCardActions>
        </div>
      </Card>
      <BoxStakeModal
        isOpen={stakeModalIsOpen}
        onDismiss={handleDismissStakeModal}
        onStake={handleOnStake}
      />
      <BoxUnstakeModal
        isOpen={unstakeModalIsOpen}
        onDismiss={handleDismissUnstakeModal}
        onUnstake={handleOnUnstake}
      />

      <BoxUnstakeAndHarvestModal
        isOpen={unstakeAndHarvestModalIsOpen}
        onDismiss={handleDismissUnstakeAndHarvestModal}
        onUnstakeAndHarvest={handleOnUnstakeAndHarvest}
      />

      <button onClick={onGetUsdc}>
        get Usdc
      </button>
      <button onClick={onGetBox}>
        get box
      </button>
      {
        !isUSDCTokenApprovedToQuickSwap && 
        ( 
          <button 
            onClick={onUSDCTokenApproveToQuickSwap}
          >
            approve usdc to quickswap
          </button>
          )
      }
      {
        !isBoxApprovedToQuickSwap && 
        ( 
          <button 
            onClick={onBoxApproveToQuickSwap}
          >
            approve box to quickswap
          </button>
          )
      }

      {
        !isLPBoxApproved && 
        ( 
          <button 
            onClick={onLPBoxApprove}
          >
            approve box LP 
          </button>
        )
      }

      <button onClick={onAddLiquidity}>
        add Liquidity
      </button>
    </>
  )
}

const StyledHeaderIcon = styled.img`
  height: 58px;
  width: 58px;
  margin-bottom: 10px;
`

const StyledTokenIcon = styled.img`
  height: 20px;
  margin-left: 10px;
`

const StyledCardTitle = styled.span`
  font-weight: 600;
  font-size: 28px;
`

const StyledCardSubtitle = styled.span`
  color: ${(props) => props.theme.colors.grey[500]};
  font-weight: 600;
  font-size: 18px;
`

const StyledCardTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-weight: 600;
  font-size: 24px;
`

const StyledLmTitle = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 24px;
`

const StyledFarmTokensAndApyWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`

const StyledFarmText = styled.span`
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 24px;
`

const StyledSectionLabel = styled.span`
  color: ${(props) => props.theme.colors.grey[500]};
  font-size: 16px;
`

interface StyledCardActionProps {
  isMobile: boolean
}

const StyledCardActions = styled.div<StyledCardActionProps>`
  display: flex;
  flex-wrap: ${(props) => (props.isMobile ? 'wrap' : 'no-wrap')};
  padding: 30px;
  padding-top: 0px;
`

export default Stake
