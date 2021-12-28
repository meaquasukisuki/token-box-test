import { useContext } from 'react'

import { FarmingBoxTokenContext } from 'contexts/FarmingBoxToken'

const useBoxTokenFarm = () => {
  return { ...useContext(FarmingBoxTokenContext) }
}

export default useBoxTokenFarm