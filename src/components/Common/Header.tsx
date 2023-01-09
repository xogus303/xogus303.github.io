import React from 'react'
import { Link } from 'gatsby'
import styled from '@emotion/styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouseChimney } from '@fortawesome/free-solid-svg-icons'

import {
  useGetCategories,
  useFormatCategory,
  useSelectedCategory,
} from 'hooks/useCategories'
import { GatsbyLinkProps } from 'components/Main/CategoryList'

const Wrap = styled.header``
const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 0 20px;
    max-width: 768px;
  }
`
const Left = styled.div`
  display: flex;
  align-items: center;
`
const HomeBtn = styled(Link)``
const Bar = styled.div`
  margin-left: 2%;
  width: 1px;
  height: 20px;
  border-radius: 2px;
  background-color: #aaa;
`
const SelectedCate = styled.div`
  position: relative;
  padding: 10px 2%;

  &:hover .HoverCateArea {
    display: flex;
  }
`
const SelectedCateText = styled.div``
const HoverCateArea = styled.div`
  z-index: 1;
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  width: 300px;
  height: 250px;
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
  location: any
}

const Header = () => {
  const { edges } = useGetCategories()
  const categoryList = useFormatCategory(edges)
  const selectedCategory = useSelectedCategory(window.location.search)
  return (
    <Wrap>
      <Inner>
        <Left>
          <HomeBtn to="/">
            <FontAwesomeIcon icon={faHouseChimney} size={'lg'} />
          </HomeBtn>
          <Bar />
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
        </Left>
      </Inner>
    </Wrap>
  )
}

export default Header
