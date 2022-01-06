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
import { fromWei, getBalance } from 'utils'

import BoxStakeModal from './components/BoxStakeModal'
import {  addLiquidity, stakeBoxLpTokens, swapETHForExactTokens } from 'index-sdk/boxStaking'
import BigNumber from 'utils/bignumber'
import { ethToBoxPath, ethToUSDCPath } from 'constants/ethContractAddresses'

const Stake: React.FC = () => {
  const [stakeModalIsOpen, setStakeModalIsOpen] = useState(false)
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
    const hasStaked = stakedBoxLpBalance && fromWei(stakedBoxLpBalance).gt(0)
    if (status !== 'connected' || !hasStaked) {
      return <Button disabled full text='Unstake & Claim' variant='secondary' />
    }

    return (
      <Button
        full
        onClick={onUnstakeAndHarvest}
        text='Unstake & Claim'
        variant='secondary'
      />
    )
  }, [stakedBoxLpBalance, status, onUnstakeAndHarvest])

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
            <Spacer />
            {UnstakeButton}
          </StyledCardActions>
        </div>
      </Card>
      <BoxStakeModal
        isOpen={stakeModalIsOpen}
        onDismiss={handleDismissStakeModal}
        onStake={handleOnStake}
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
