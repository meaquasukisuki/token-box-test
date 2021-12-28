import { createContext } from 'react'

type WalletType = 'injected' | 'walletconnect' | 'walletlink' | 'ledgerwallet'

interface LanguageContextValues {
  language:string
  setLanguage(language:string):void
}

const WalletContext = createContext<LanguageContextValues>({
  language:'en',
  setLanguage: () => {}
})

export default WalletContext
