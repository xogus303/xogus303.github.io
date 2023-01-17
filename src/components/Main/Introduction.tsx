import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import styled from '@emotion/styled'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsUpDown } from '@fortawesome/free-solid-svg-icons'
import { keyframes } from '@emotion/react'
import useIntervalWriteText from 'hooks/useIntervalWriteText'
import { cssState } from 'constants/type'

const wrapperShowAnim = keyframes`
  0% {
    border: 0.2rem solid transparent;
    box-shadow: 0 0 0.1rem transparent, 0 0 0.1rem transparent, 0 0 1rem transparent,
      0 0 0.4rem transparent, 0 0 1.4rem transparent, inset 0 0 0.6rem transparent;
  }
  100% {
    border: 0.2rem solid #fff;
    box-shadow: 0 0 0.1rem #fff, 0 0 0.1rem #fff, 0 0 1rem #ff0080,
      0 0 0.4rem #ff0080, 0 0 1.4rem #ff0080, inset 0 0 0.6rem #ff0080;
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

const Background = styled.div`
  position: relative;
  padding-top: 44px;
  width: 100%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
`

const Wrapper = styled.div<cssState>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  max-width: 1100px;
  height: ${props => (props.isActive ? '100vh' : '400px')};
  margin: 0 auto;
  transition: 1s;

  @media (max-width: 768px) {
    width: 100%;
    height: 300px;
    padding: 0 20px;
  }
`
const BackgroundBg = styled(GatsbyImage)`
  z-index: -1;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  width: 100%;
  object-fit: cover;
`
const TextArea = styled.div<cssState>`
  padding: 5% 3%;
  border-radius: 20px;
  animation: ${wrapperShowAnim} 0.5s 2s both;
  transform: ${props => (props.isActive ? 'translateY(-50%)' : {})};
  transition: 0.5s;
`
const NeonText = styled.div`
  color: white;
  text-shadow: 0 0 3px #fff, 0 0 6px #fff, 0 0 12px #ff0080, 0 0 18px #ff0080,
    0 0 24px #ff0080, 0 0 33px #ff0080, 0 0 45px #ff0080;
`
const Subtitle = styled(NeonText)`
  font-size: 16px;
  height: 16px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`

const Title = styled(NeonText)`
  margin-top: 10px;
  font-size: 35px;
  height: 35px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 25px;
  }
`
const DownIconArea = styled.button`
  position: absolute;
  right: 35%;
  bottom: 35%;
  padding: 5px;
  border: 0.2rem solid #fff;
  border-radius: 20px;
  box-shadow: 0 0 0.1rem #fff, 0 0 0.1rem #fff, 0 0 1rem #ff0080,
    0 0 0.4rem #ff0080, 0 0 1.4rem #ff0080, inset 0 0 0.6rem #ff0080;
  animation: ${arrowUpDownAnim} 1s 2.5s infinite alternate-reverse;
  opacity: 0;

  &:hover {
    animation-play-state: paused;
  }
`

type IntroductionProps = {
  introduceBg: IGatsbyImageData
  isIntro: boolean
  hideIntro: () => void
}

const Introduction: FunctionComponent<IntroductionProps> = ({
  introduceBg,
  isIntro,
  hideIntro,
}) => {
  const [showInfoText, setShowInfoText] = useState<boolean>(false)

  const handleFirstWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (
        showInfoText === true &&
        isIntro === true &&
        e.nativeEvent.deltaY > 0
      ) {
        hideIntro()
      }
    },
    [isIntro, showInfoText],
  )

  useEffect(() => {
    setTimeout(() => {
      setShowInfoText(true)
    }, 2000)
  }, [])

  return (
    <Background onWheel={handleFirstWheel}>
      <BackgroundBg image={introduceBg} alt="introduce background image" />
      <Wrapper isActive={isIntro}>
        <TextArea isActive={isIntro}>
          <Subtitle>
            {showInfoText === true ? 'by 프론트엔드 개발자 김태현' : ' '}
          </Subtitle>
          <Title>{useIntervalWriteText('이해를 위한 기술블로그')}</Title>
        </TextArea>
        {isIntro === true && (
          <DownIconArea onClick={hideIntro}>
            <FontAwesomeIcon icon={faArrowsUpDown} color={'white'} />
          </DownIconArea>
        )}
      </Wrapper>
    </Background>
  )
}

export default Introduction
