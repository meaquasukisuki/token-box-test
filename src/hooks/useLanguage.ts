import { useContext } from 'react'

import { LanguageContext } from 'contexts/LangugeProvider'

type setLanguageType = (language:string) => void

interface UseLanguageHookTuple extends Array<string|Function>{
  0:string,
  1:setLanguageType
}

const useLanguage = () => {
  const {language,setLanguage} = useContext(LanguageContext)
  
  const res: UseLanguageHookTuple = [language,setLanguage]
  return res
}

export default useLanguage