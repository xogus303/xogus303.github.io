import React from 'react'
import styled from '@emotion/styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouseChimney } from '@fortawesome/free-solid-svg-icons'

const Wrap = styled.header``
const Inner = styled.div`
  padding: 10px 0;
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 5%;
    max-width: 768px;
  }
`
const Left = styled.div`
  display: flex;
  align-items: center;
`
const HomeBtn = styled.button``
const Bar = styled.div`
  margin: 0 2%;
  width: 1px;
  height: 20px;
  border-radius: 2px;
  background-color: #000;
`
const SelectedCate = styled.div`
  cursor: pointer;
`
const SelectedCateText = styled.div``

const Header = props => {
  return (
    <Wrap>
      <Inner>
        <Left>
          <HomeBtn>
            <FontAwesomeIcon icon={faHouseChimney} size={'2x'} />
          </HomeBtn>
          <Bar />
          <SelectedCate>
            <SelectedCateText>All</SelectedCateText>
          </SelectedCate>
        </Left>
      </Inner>
    </Wrap>
  )
}

export default Header
