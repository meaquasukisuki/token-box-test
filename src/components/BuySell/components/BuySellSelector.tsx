import React from 'react'

import styled from 'styled-components'

import useBuySell from 'hooks/useBuySell'

import { useIntl } from 'react-intl'

const BuySellSelector: React.FC = () => {
  const intl = useIntl();
  const { isUserBuying, onToggleIsUserBuying } = useBuySell()

  if (isUserBuying) {
    return (
      <StyledCardHeader>
        <StyledActiveButton>
          {intl.formatMessage({
            id:"buy"
          })}
        </StyledActiveButton>
        <StyledBuySellButton onClick={onToggleIsUserBuying}>
          {intl.formatMessage({
            id:"sell"
          })}
        </StyledBuySellButton>
      </StyledCardHeader>
    )
  }

  return (
    <StyledCardHeader>
      <StyledBuySellButton onClick={onToggleIsUserBuying}>
        {intl.formatMessage({
          id:"buy"
        })}
      </StyledBuySellButton>
      <StyledActiveButton>
        {intl.formatMessage({
          id:"sell"
        })}
      </StyledActiveButton>
    </StyledCardHeader>
  )
}

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

const StyledBuySellButton = styled.button`
  width: 50%;
  background: none;
  font-size: 20px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid ${(props) => props.theme.colors.grey[400]};
  color: ${(props) => props.theme.colors.grey[400]};
  padding-bottom: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  outline: none;
  &:hover {
    border-bottom: 2px solid ${(props) => props.theme.textColor};
    color: ${(props) => props.theme.textColor};
  }
`

const StyledActiveButton = styled.button`
  width: 50%;
  background: none;
  font-size: 20px;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid ${(props) => props.theme.colors.primary.light};
  color: ${(props) => props.theme.colors.primary.light};
  padding-bottom: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  outline: none;
`

export default BuySellSelector
