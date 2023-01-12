import React, { useState } from 'react'
import { useInterval } from '@react-hooks-library/core'

const useIntervalWriteText = (completedTitle: string) => {
  const [landingTitle, setLadingTitle] = useState<string>('')
  const [count, setCount] = useState<number>(0)

  useInterval(() => {
    if (count >= completedTitle.length) return

    setLadingTitle(prev => {
      let result = prev ? prev + completedTitle[count] : completedTitle[0]
      console.log('prev', prev)
      console.log('result', result)
      setCount(prevCount => prevCount + 1)

      return result
    })
  }, 150)

  return landingTitle
  //   return completedTitle
}

export default useIntervalWriteText
