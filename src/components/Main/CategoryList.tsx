import React, { FunctionComponent, ReactNode } from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

type CategoryItemProps = {
  active?: boolean
}

export type GatsbyLinkProps = {
  children: ReactNode
  className?: string
  to: string
} & CategoryItemProps

export type CategoryListProps = {
  selectedCategory: string
  categoryList: {
    [key: string]: number
  }
}

const CategoryListWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 768px;
  margin: 100px auto 0;

  @media (max-width: 768px) {
    width: 100%;
    margin-top: 50px;
    padding: 0 20px;
  }
`

const CategoryItem = styled(({ active, ...props }: GatsbyLinkProps) => (
  <Link {...props} />
))`
  margin-right: 20px;
  padding: 5px 0;
  font-size: 18px;
  font-family: ${({ active }) =>
    active ? 'Spoqa Han Sans Bold' : 'Spoqa Han Sans Regular'};
  color: ${({ active }) => (active ? '#000' : '#aaa')};
  cursor: pointer;

  &:last-of-type {
    margin-right: 0;
  }

  @media (max-width: 768px) {
    font-size: 15px;
  }
`

const CategoryList: FunctionComponent<CategoryListProps> = ({
  selectedCategory,
  categoryList,
}) => {
  return (
    <CategoryListWrapper>
      {Object.entries(categoryList).map(([name, count]) => {
        return (
          <CategoryItem
            to={`/?category=${name}`}
            active={name === selectedCategory}
            key={name}
          >
            #{name}({count})
          </CategoryItem>
        )
      })}
    </CategoryListWrapper>
  )
}

export default CategoryList
