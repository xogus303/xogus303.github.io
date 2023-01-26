import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

import { GatsbyImage } from 'gatsby-plugin-image'
import { PostFrontmatterType } from 'types/PostItem.types'
import { GatsbyLinkProps } from './CategoryList'
import { cssState } from 'constants/type'

type PostItemProps = PostFrontmatterType & {
  link: string
  selectedCategory?: string
}

const PostItemWrapper = styled(({ ...props }: GatsbyLinkProps) => (
  <Link {...props} />
))`
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
  &:hover img {
    transform: scale(1.1);
    transition: 0.4s;
  }
`
const PostItemInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 5%;
`
const ThumbnailImage = styled(GatsbyImage)`
  border-radius: 4px 4px 0 0;
  object-fit: cover;
  transition: 0.4s transform;
`
const PostItemInfoText = styled.div`
  flex: 0.5;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 5px 0;
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
  font-size: 18px;
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
`

const CategoryItem = styled.div`
  margin-left: 5px;
  padding: 3px 5px;
  border-radius: 3px;
  background: black;
  font-size: 14px;
  font-weight: 700;
  color: white;
`

const Summary = styled.div<cssState>`
  display: -webkit-box;
  overflow: hidden;
  margin: auto 0;
  text-overflow: ellipsis;
  white-space: normal;
  overflow-wrap: break-word;
  -webkit-line-clamp: ${props => (props.hasImg ? 2 : 6)};
  -webkit-box-orient: vertical;
  opacity: 0.8;
`
const PostItem: FunctionComponent<PostItemProps> = ({
  title,
  date,
  categories,
  summary,
  thumbnail,
  link,
  selectedCategory,
}) => {
  return (
    <PostItemWrapper to={`${link}?category=${selectedCategory}`}>
      {thumbnail !== null && (
        <ThumbnailImage
          image={thumbnail.childImageSharp.gatsbyImageData}
          alt="Post Item Image"
        />
      )}
      <PostItemInfo>
        <Title>{title}</Title>
        <PostItemInfoText>
          <Date>{date}</Date>
          <Category>
            {categories.map(category => (
              <CategoryItem key={category}>{category}</CategoryItem>
            ))}
          </Category>
        </PostItemInfoText>
        <Summary hasImg={thumbnail !== null}>{summary}</Summary>
      </PostItemInfo>
    </PostItemWrapper>
  )
}

export default PostItem
