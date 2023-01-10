import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'

import ProfileImage from './ProfileImage'

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
const TextArea = styled.div`
  padding: 5% 3%;
  border: 0.2rem solid #fff;
  box-shadow: 0 0 0.2rem #fff, 0 0 0.2rem #fff, 0 0 2rem #0fa, 0 0 0.8rem #0fa,
    0 0 2.8rem #0fa, inset 0 0 1.3rem #0fa;
  border-radius: 20px;
`
const NeonText = styled.div`
  color: white;
  text-shadow: 0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #0fa,
    0 0 82px #0fa, 0 0 92px #0fa, 0 0 102px #0fa, 0 0 151px #0fa;
`
const Subtitle = styled(NeonText)`
  font-size: 20px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`

const Title = styled(NeonText)`
  margin-top: 5px;
  font-size: 35px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 25px;
  }
`

const Introduction: FunctionComponent<IntroductionProps> = ({
  introduceBg,
}) => {
  console.log('introduceBg', introduceBg)
  return (
    <Background>
      <BackgroundBg image={introduceBg} alt="introduce background image" />
      <Wrapper>
        {/* <ProfileImage profileImage={profileImage} /> */}
        <TextArea>
          <Subtitle>이해를 위한 기술블로그</Subtitle>
          <Title>by 프론트엔드 개발자 김태현</Title>
        </TextArea>
      </Wrapper>
    </Background>
  )
}

export default Introduction
