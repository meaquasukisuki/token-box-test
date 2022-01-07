import React, { useCallback, useMemo, useState } from 'react'

import {
  Button,
  ModalActions,
  ModalContent,
  ModalProps,
  ModalTitle,
} from 'react-neu'

import Modal from 'components/CustomModal'
import TokenInput from 'components/TokenInput'
import useBalances from 'hooks/useBalances'
import { fromWei, getFullDisplayBalance } from 'utils'
import BigNumber from 'utils/bignumber'

interface UnstakeModalProps extends ModalProps {
  onUnstakeAndHarvest: (amount: string) => void
}

const UnstakeAndHarvestModal: React.FC<UnstakeModalProps> = ({
  isOpen,
  onDismiss,
  onUnstakeAndHarvest,
}) => {
  const [val, setVal] = useState('')
  const { userStakedBoxLpBalance } = useBalances()

  const fullBalance = useMemo(() => {
    return getFullDisplayBalance(fromWei(userStakedBoxLpBalance), 0)
  }, [userStakedBoxLpBalance])
  
  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.value)
    },
    [setVal]
  )

  const handleSelectMax = useCallback(() => {
    setVal(fullBalance)
  }, [fullBalance, setVal])

  const handleUnstakeAndHarvestClick = useCallback(() => {
    onUnstakeAndHarvest(val)
  }, [onUnstakeAndHarvest, val])

  return (
    <Modal isOpen={isOpen}>
      <ModalTitle text='Unstake And Harvest'/>
      <ModalContent>
        <TokenInput
          value={val}
          onSelectMax={handleSelectMax}
          onChange={handleChange}
          max={fullBalance}
          symbol='Uniswap USDC/BOX LP Tokens'
        />
      </ModalContent>
      <ModalActions>
        <Button 
          onClick={onDismiss} 
          text='Cancel' variant='secondary' 
        />
        <Button
          disabled={!val || !Number(val)}
          onClick={handleUnstakeAndHarvestClick}
          text='Unstake And Harvest'
          variant={!val || !Number(val) ? 'secondary' : 'default'}
        />
      </ModalActions>
    </Modal>
  )
}

export default UnstakeAndHarvestModal
