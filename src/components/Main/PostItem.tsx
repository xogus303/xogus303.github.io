import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

import { GatsbyImage } from 'gatsby-plugin-image'
import { PostFrontmatterType } from 'types/PostItem.types'
import { GatsbyLinkProps } from './CategoryList'

type PostItemProps = PostFrontmatterType & {
  link: string
  selectedCategory?: string
}

const PostItemWrapper = styled(({ ...props }: GatsbyLinkProps) => (
  <Link {...props} />
))`
  padding: 15px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
  transition: 0.3s box-shadow;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }
`
const PostItemInfo = styled.div`
  display: flex;
`
const ThumbnailImage = styled(GatsbyImage)`
  max-width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
`
const PostItemInfoText = styled.div`
  flex: 1;
  padding: 5px 5px 5px 10px;
`
const PostItemContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const Title = styled.div`
  display: -webkit-box;
  overflow: hidden;
  margin-bottom: 3px;
  text-overflow: ellipsis;
  white-space: normal;
  overflow-wrap: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 20px;
  font-weight: 700;
`

const Date = styled.div`
  font-size: 14px;
  font-weight: 400;
  opacity: 0.7;
`

const Category = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  margin: 10px -5px;
`

const CategoryItem = styled.div`
  margin: 2.5px 5px;
  padding: 3px 5px;
  border-radius: 3px;
  background: black;
  font-size: 14px;
  font-weight: 700;
  color: white;
`

const Summary = styled.div`
  display: -webkit-box;
  overflow: hidden;
  margin-top: auto;
  text-overflow: ellipsis;
  white-space: normal;
  overflow-wrap: break-word;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 16px;
  opacity: 0.8;
`
const PostItem: FunctionComponent<PostItemProps> = ({
  title,
  date,
  categories,
  summary,
  thumbnail: {
    childImageSharp: { gatsbyImageData },
  },
  link,
  selectedCategory,
}) => {
  return (
    <PostItemWrapper to={`${link}?category=${selectedCategory}`}>
      <PostItemInfo>
        <PostItemInfoText>
          <Title>{title}</Title>
          <Date>{date}</Date>
          <Category>
            {categories.map(category => (
              <CategoryItem key={category}>{category}</CategoryItem>
            ))}
          </Category>
        </PostItemInfoText>
        <ThumbnailImage image={gatsbyImageData} alt="Post Item Image" />
      </PostItemInfo>
      <PostItemContent>
        <Summary>{summary}</Summary>
      </PostItemContent>
    </PostItemWrapper>
  )
}

export default PostItem
