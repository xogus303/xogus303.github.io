import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'gatsby'
import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouseChimney } from '@fortawesome/free-solid-svg-icons'

import {
  useGetCategories,
  useFormatCategory,
  useSelectedCategory,
} from 'hooks/useCategories'
import { GatsbyLinkProps } from 'components/Main/CategoryList'
import { cssState } from 'constants/type'

const Wrap = styled.header<cssState>`
  z-index: 1;
  position: fixed;
  width: 100%;
  background-color: #000;
`
const Inner = styled.div`
  display: flex;
  margin: 0 auto;
  max-width: 1100px;
  height: 46px;
  justify-content: space-between;

  @media (max-width: 1080px) {
    padding: 0 20px;
    width: 100%;
  }
`
const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`
const Right = styled(Left)`
  flex: 0;
`
const HomeBtn = styled(Link)`
  margin-top: -2px;
`
const LogoTextArea = styled.div<cssState>`
  display: flex;
  align-items: center;
  opacity: ${props => (props.isActive ? 0 : 1)};
  transition: 2s;
`
const Bar = styled.div`
  margin: 0 15px;
  width: 1px;
  height: 16px;
  border-radius: 2px;
  background-color: #aaa;
`
const LogoText = styled.strong`
  color: white;
`
const SelectedCate = styled.div`
  display: flex;
  position: relative;
  justify-content: flex-end;

  &:hover {
    width: 300px;
  }

  &:hover .HoverCateArea {
    display: flex;
  }
`
const SelectedCateText = styled.div`
  color: white;
  padding: 2px 30px;
  border: 1px solid white;
  border-radius: 17px;
  cursor: pointer;
`
const HoverCateArea = styled.div`
  z-index: 1;
  display: none;
  position: absolute;
  top: 100%;
  right: -20px;
  width: 300px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fff;
`
const HoverCateList = styled.div`
  float: left;
  padding: 15px;
  width: 100%;
  height: 100%;
`
const HoverCateItem = styled.div`
  display: inline-block;
  margin-bottom: 10px;
`
const HoverCate = styled(({ active, ...props }: GatsbyLinkProps) => (
  <Link {...props} />
))`
  margin-top: 8px;
  margin-right: 10px;
  color: ${({ active }) => (active ? '#000' : '#aaa')};

  &:hover {
    color: black;
    text-decoration: underline;
  }
`

const HoverCateText = styled.strong``

interface HeaderProps {
  isIntro: boolean
}

const Header = ({ isIntro = false }: HeaderProps) => {
  const { edges } = useGetCategories()
  const categoryList = useFormatCategory(edges)
  const selectedCategory = useSelectedCategory(window.location.search)

  const [isFixed, setIsFixed] = useState<boolean>(true)

  const handleFixheader = () => {
    if (window.scrollY >= 400) {
      setIsFixed(true)
    } else {
      setIsFixed(false)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleFixheader)

    return () => {
      window.removeEventListener('scroll', handleFixheader)
    }
  }, [])

  return (
    <Wrap>
      <Inner>
        <Left>
          <HomeBtn to="/">
            <FontAwesomeIcon
              icon={faHouseChimney}
              size={'lg'}
              color={'white'}
            />
          </HomeBtn>
          <LogoTextArea isActive={isIntro}>
            <Bar />
            <LogoText>이해를 위한 기술블로그</LogoText>
          </LogoTextArea>
        </Left>
        <Right>
          <SelectedCate>
            <SelectedCateText>{selectedCategory}</SelectedCateText>
            <HoverCateArea className="HoverCateArea">
              <HoverCateList>
                {Object.entries(categoryList).map(cate => {
                  return (
                    <HoverCateItem key={cate[0]}>
                      <HoverCate
                        to={`/?category=${cate[0]}`}
                        active={cate[0] === selectedCategory}
                      >
                        <HoverCateText>
                          {cate[0]}({cate[1]})
                        </HoverCateText>
                      </HoverCate>
                    </HoverCateItem>
                  )
                })}
              </HoverCateList>
            </HoverCateArea>
          </SelectedCate>
        </Right>
      </Inner>
    </Wrap>
  )
}

export default Header
