import React, {useState} from 'react'
import { IntlProvider } from 'react-intl'
import LanguageContext from './LanguageContext'
import appLocales from 'lang/index';

const LanguageProvider: React.FC = (props) => {
  const {children} = props
  const [language, setLanguage] = useState('en')
  const localeConfig = appLocales[language];
  
  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage
      }}
    >
      <IntlProvider locale={localeConfig.locale} messages={localeConfig.messages}>
          {children}
      </IntlProvider>

    </LanguageContext.Provider>
  )
}

export default LanguageProvider
