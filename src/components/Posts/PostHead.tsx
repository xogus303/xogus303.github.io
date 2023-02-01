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
}

const PostHeadWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 46px;
  width: 100%;
  align-items: center;
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
}) => {
  return (
    <PostHeadWrapper>
      <PostHeadInfo
        title={title}
        series={series}
        date={date}
        categories={categories}
      />
      {thumbnail && <BackgroundImage image={thumbnail} alt="thumbnail" />}
    </PostHeadWrapper>
  )
}

export default PostHead
