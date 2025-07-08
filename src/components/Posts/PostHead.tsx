import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'
import PostHeadInfo, { PostHeadInfoProps } from './PostHeadInfo'

type GatsbyImgProps = {
  image: IGatsbyImageData
  alt: string
  className?: string
}

type PostHeadProps = PostHeadInfoProps & {
  thumbnail: IGatsbyImageData | undefined
  thumbnailOrigin?: string
}

const PostHeadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 46px;
  width: 100%;
  align-items: center;
`

const PostThumbnail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;

  @media (max-width: 768px) {
    padding: 0px 20px;
  }
`

const OriginText = styled.a`
  color: #999;
  font-size: 13px;
`

const BackgroundImage = styled((props: GatsbyImgProps) => (
  <GatsbyImage {...props} />
))`
  z-index: -1;
  max-width: 768px;
  width: 100%;
  object-fit: contain;
  border-radius: 6px;
`

const PostHead: FunctionComponent<PostHeadProps> = ({
  title,
  series,
  date,
  categories,
  thumbnail,
  thumbnailOrigin,
}) => {
  return (
    <PostHeadWrapper>
      <PostHeadInfo
        title={title}
        series={series}
        date={date}
        categories={categories}
      />
      <PostThumbnail>
        {thumbnail && <BackgroundImage image={thumbnail} alt="thumbnail" />}
        {thumbnailOrigin && (
          <OriginText href={thumbnailOrigin}>{thumbnailOrigin}</OriginText>
        )}
      </PostThumbnail>
    </PostHeadWrapper>
  )
}

export default PostHead
