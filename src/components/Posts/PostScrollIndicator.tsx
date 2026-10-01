import React from 'react'
import styled from '@emotion/styled'
import { cssState } from 'constants/type'
import { color } from 'constants/color'

const Wrapper = styled.div`
  position: fixed;
  top: 46px;
  width: 100%;
`
const Indicator = styled.div<cssState>`
  width: ${props => props.percent}%;
  height: 4px;
  background-color: ${color.accent};
`

interface PostScrollIndicatorProps {
  widthPercent: number
}

const PostScrollIndicator = ({ widthPercent }: PostScrollIndicatorProps) => {
  return (
    <Wrapper>
      <Indicator percent={widthPercent} />
    </Wrapper>
  )
}

export default PostScrollIndicator
