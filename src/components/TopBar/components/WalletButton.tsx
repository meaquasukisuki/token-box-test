import React, { useCallback, useEffect } from 'react'

import { Button } from 'react-neu'

import styled from 'styled-components'

import Davatar from '@davatar/react'
import { shortenAddress } from '@usedapp/core'

import UnlockWalletModal from 'components/UnlockWalletModal'
import WalletModal from 'components/WalletModal'
import useWallet from 'hooks/useWallet'

import { useEnsDomain } from 'hooks/useEnsDomain'
import { useIntl } from 'react-intl'

const WalletButton: React.FC = () => {

  const {
    account,
    ethereum,
    isShowingWalletModal,
    onCloseWalletModal,
    onOpenWalletModal,
    status,
    connect,
  } = useWallet()
  
  const ens = useEnsDomain()
  const intl = useIntl()
  const onClick = useCallback(() => {
    // If the user comes from the onto app it should directly connect without opening the web3 modal
    if (status !== 'connected' && (window as any).ethereum?.isONTO) {
      connect('injected')

    } else {
      onOpenWalletModal()
    }
  }, [status, connect, onOpenWalletModal])

  let openWalletText = getOpenWalletText(account, ens)
  if (openWalletText === 'Connect Wallet') {
    openWalletText = intl.formatMessage({
      id: 'connect-wallet'
    })
  }
  const variant = !!account ? 'tertiary' : 'default'

  return (
    <>
      <Button
        onClick={onClick}
        size='md'
        text={openWalletText}
        variant={variant}
      >
        {account && (
          <StyledDavatar>
            <Davatar
              size={24}
              address={account}
              provider={ethereum}
              generatedAvatarType='jazzicon' // optional, 'jazzicon' or 'blockies'
            />
          </StyledDavatar>
        )}
      </Button>
      <WalletModal
        isOpen={!!account && isShowingWalletModal}
        onDismiss={onCloseWalletModal}
      />
      <UnlockWalletModal
        isOpen={!account && isShowingWalletModal}
        onDismiss={onCloseWalletModal}
      />
    </>
  )
}

function getOpenWalletText(
  account: string | null | undefined,
  ens: string | null | undefined
) {
  if (account && ens) {
    return ens
  } else if (account) {
    return shortenAddress(account)
  } else {
    return 'Connect Wallet'
  }
}

const StyledDavatar = styled.div`
  margin-right: 6px;
`

export default WalletButton
