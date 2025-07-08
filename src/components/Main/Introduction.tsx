import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import styled from '@emotion/styled'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDown } from '@fortawesome/free-solid-svg-icons'
import { keyframes } from '@emotion/react'
import useIntervalWriteText from 'hooks/useIntervalWriteText'
import { cssState } from 'constants/type'
import useScrollOrSwipeUp from 'hooks/useScrollOrSwipeUp'

const Background = styled.div`
  position: relative;
  width: 100%;
`

const Wrapper = styled.div<cssState>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  max-width: 1100px;
  height: ${props => (props.isActive ? '100vh' : '0px')};
  margin: 0 auto;
  transition: 1s;
  gap: 10%;

  @media (max-width: 1080px) {
    width: 100%;
    align-items: center;
  }
`
const TextArea = styled.div<cssState>`
  opacity: ${props => (props.isActive ? 1 : 0)};
  transition: opacity 1s;
`

const Title = styled.strong`
  font-size: 35px;

  @media (max-width: 1080px) {
    font-size: 25px;
  }
`

const arrowUpDownAnim = keyframes`
  0% {
    opacity: 1;
    transform: translateY(-100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0%);
  }
`
const DownIconArea = styled.div`
  display: flex;
  width: 80%;
  height: 40px;
  justify-content: flex-end;

  @media (max-width: 1080px) {
    justify-content: center;
  }
`
const DownIcon = styled.div<cssState>`
  display: flex;
  justify-items: flex-end;
  animation: ${props => (props.isActive ? arrowUpDownAnim : 'none')} 1s 0s
    infinite alternate-reverse;
  opacity: ${props => (props.isActive ? 1 : 0)};
  transition: opacity 1s;

  &:hover {
    animation-play-state: paused;
  }

  @media (max-width: 1080px) {
    justify-content: center;
  }
`
const DownIconBtn = styled.button`
  padding: 8px 5px;
  border: 0.2rem solid #000;
  border-radius: 20px;
  /* box-shadow: 0 0 0.1rem #fff, 0 0 0.1rem #fff, 0 0 1rem #ff0080,
    0 0 0.4rem #ff0080, 0 0 1.4rem #ff0080, inset 0 0 0.6rem #ff0080; */
`

type IntroductionProps = {
  isIntro: boolean
  hideIntro: () => void
}
const welcomeText = 'Welcome to TH Dev Note.'
const Introduction: FunctionComponent<IntroductionProps> = ({
  isIntro,
  hideIntro,
}) => {
  const [showInfoText, setShowInfoText] = useState<boolean>(false)

  useScrollOrSwipeUp(showInfoText === true && isIntro === true, hideIntro)

  useEffect(() => {
    setTimeout(() => {
      setShowInfoText(true)
    }, welcomeText.length * 150 + 500)
  }, [])

  return (
    <Background>
      <Wrapper isActive={isIntro}>
        <TextArea isActive={isIntro}>
          <Title>{useIntervalWriteText(welcomeText, !isIntro)}</Title>
        </TextArea>
        <DownIconArea>
          {showInfoText && (
            <DownIcon onClick={hideIntro} isActive={isIntro}>
              <DownIconBtn>
                <FontAwesomeIcon icon={faArrowsUpDown} color={'#000'} />
              </DownIconBtn>
            </DownIcon>
          )}
        </DownIconArea>
      </Wrapper>
    </Background>
  )
}

export default Introduction
