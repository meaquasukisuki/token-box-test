import useLanguage from 'hooks/useLanguage'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { useTheme } from 'react-neu'
import Select from 'react-select'

const LanguageSelector = () => {
  const intl = useIntl()
  const theme = useTheme()
  const [language,setLanguage] = useLanguage()

  const styles = useMemo(
    () => ({
      control: (styles: any) => ({
        ...styles,
        width: 135,
        background: `rgba(0, 0, 0, 0.4)`,
        padding: 7,
        border: 'none',
        borderRadius: 14,
      }),
      singleValue: (styles: any) => ({
        ...styles,
        color: theme.textColor,
        fontWeight: 600,
        fontSize: 16,
        width: 130,
        textAlign: 'left',
      }),
      menu: (styles: any) => ({
        ...styles,
        color: 'black',
      }),
      dropdownIndicator: (styles: any) => ({
        ...styles,
        'color': theme.textColor,
        'cursor': 'pointer',
        '&:hover': {
          color: theme.textColor,
        },
      }),
      indicatorSeparator: () => ({}),
      indicatorContainer: (styles: any) => ({
        ...styles,
        marginLeft: 0,
        padding: 0,
      }),
    }),
    [theme]
  )

  return (
    <Select
      isSearchable={false}
      value={{ label: intl.formatMessage({id:'select-language-label'}) } as any}
      onChange={(language) => {
        setLanguage(language.value)
      }}
      options={[
        {
          value: 'en',
          label: 'English',
        },
        {
          value: 'cn',
          label: '大陆中文',
        },
        {
          value: 'tw',
          label: '繁體中文',
        },
      ]}
      styles={styles}
    />
  )
}

export default LanguageSelector
