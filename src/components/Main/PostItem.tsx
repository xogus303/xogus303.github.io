import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

import { GatsbyImage } from 'gatsby-plugin-image'
import { PostFrontmatterType } from 'types/PostItem.types'
import { GatsbyLinkProps } from './CategoryList'
import { cssState } from 'constants/type'
import { color } from 'constants/color'

type PostItemProps = PostFrontmatterType & {
  link: string
  selectedCategory?: string
  seriesIndex?: number
  seriesTotal?: number
}

const PostItemWrapper = styled(({ ...props }: GatsbyLinkProps) => (
  <Link {...props} />
))`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  box-shadow: 0 8px 24px ${color.shadow};
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s box-shadow, 0.2s transform;

  &:hover {
    box-shadow: 0 12px 32px rgba(20, 22, 26, 0.14);
    transform: translateY(-2px);
  }
  &:hover img {
    transform: scale(1.1);
    transition: 0.4s;
  }
  &:not(:hover) img {
    transform: scale(1);
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
  object-fit: cover;
  transition: 0.4s transform;
`
const PostItemInfoText = styled.div`
  flex: 0.5;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 5px 0;
`

const SeriesBadge = styled.div`
  display: inline-flex;
  align-self: flex-start;
  margin-bottom: 8px;
  padding: 3px 10px;
  border-radius: 999px;
  background: ${color.accent};
  font-size: 11px;
  font-weight: 700;
  color: ${color.white};
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
  color: ${color.ink};
`

const Date = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${color.mutedLight};
`

const Category = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  gap: 5px;
`

const CategoryItem = styled.div`
  padding: 3px 10px;
  border-radius: 999px;
  background: ${color.accentTint};
  font-size: 13px;
  font-weight: 700;
  color: ${color.accent};
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
  color: ${color.muted};
`

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`

const TagItem = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${color.mutedLight};
`

const PostItem: FunctionComponent<PostItemProps> = ({
  title,
  series,
  date,
  categories,
  tags,
  summary,
  thumbnail,
  link,
  selectedCategory,
  seriesIndex,
  seriesTotal,
}) => {
  const showSeriesOrder =
    typeof seriesIndex === 'number' &&
    seriesIndex >= 0 &&
    typeof seriesTotal === 'number' &&
    seriesTotal > 1

  return (
    <PostItemWrapper to={`${link}?category=${selectedCategory}`}>
      {thumbnail && thumbnail.childImageSharp.gatsbyImageData ? (
        <ThumbnailImage
          image={thumbnail.childImageSharp.gatsbyImageData}
          alt="Post Item Image"
        />
      ) : null}
      <PostItemInfo>
        {series && (
          <SeriesBadge>
            {series}
            {showSeriesOrder && ` (${(seriesIndex as number) + 1}/${seriesTotal})`}
          </SeriesBadge>
        )}
        <Title>{title}</Title>
        <PostItemInfoText>
          <Category>
            {categories.map(category => (
              <CategoryItem key={category}>{category}</CategoryItem>
            ))}
          </Category>
          <Date>{date}</Date>
        </PostItemInfoText>
        <Summary hasImg={thumbnail ? true : false}>{summary}</Summary>
        {tags && tags.length > 0 && (
          <Tags>
            {tags.map(tag => (
              <TagItem key={tag}>#{tag}</TagItem>
            ))}
          </Tags>
        )}
      </PostItemInfo>
    </PostItemWrapper>
  )
}

export default PostItem
