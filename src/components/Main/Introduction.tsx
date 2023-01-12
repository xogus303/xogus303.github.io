import React, { FunctionComponent, useEffect, useState } from 'react'
import styled from '@emotion/styled'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'

import ProfileImage from './ProfileImage'
import { keyframes } from '@emotion/react'
import useIntervalWriteText from 'hooks/useIntervalWriteText'

type IntroductionProps = {
  introduceBg: IGatsbyImageData
}

const Background = styled.div`
  position: relative;
  width: 100%;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.7);
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  max-width: 1100px;
  height: 400px;
  margin: 0 auto;

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
const slideDownAnim = keyframes`
  0% {
    opacity: 0;
  transform: translateY(-30%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`
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
const TextArea = styled.div`
  padding: 5% 3%;
  border-radius: 20px;
  animation: ${wrapperShowAnim} 0.5s 2s both;
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

const Introduction: FunctionComponent<IntroductionProps> = ({
  introduceBg,
}) => {
  const [showInfoText, setShowInfoText] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      setShowInfoText(true)
    }, 2000)
  }, [])

  return (
    <Background>
      <BackgroundBg image={introduceBg} alt="introduce background image" />
      <Wrapper>
        {/* <ProfileImage profileImage={profileImage} /> */}
        <TextArea>
          <Subtitle>
            {showInfoText === true ? 'by 프론트엔드 개발자 김태현' : ' '}
          </Subtitle>
          <Title>{useIntervalWriteText('이해를 위한 기술블로그')}</Title>
        </TextArea>
      </Wrapper>
    </Background>
  )
}

export default Introduction
