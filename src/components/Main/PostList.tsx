import React, { FunctionComponent, useMemo } from 'react'
import styled from '@emotion/styled'

import PostItem from './PostItem'
import { PostListItemType } from 'types/PostItem.types'
import useInfiniteScroll, {
  useInfiniteScrollType,
} from 'hooks/useInfiniteScroll'

type PostListProps = {
  selectedCategory: string
  posts: PostListItemType[]
}

const PostListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 3em;
  max-width: 1100px;
  margin: 0 auto;
  padding: 100px 0;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr 1fr;
    grid-gap: 2% 5%;
    padding: 70px 20px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-gap: 1% 2%;
    width: 100%;
    padding: 70px 20px;
  }
`

const PostList: FunctionComponent<PostListProps> = function ({
  selectedCategory,
  posts,
}) {
  const { containerRef, postList }: useInfiniteScrollType = useInfiniteScroll(
    selectedCategory,
    posts,
  )
  return (
    <PostListWrapper ref={containerRef}>
      {postList
        .filter(i => i.node.frontmatter.categories?.length > 0)
        .map(
          ({
            node: {
              id,
              fields: { slug },
              frontmatter,
            },
          }: PostListItemType) => {
            return (
              <PostItem
                {...frontmatter}
                link={slug}
                key={id}
                selectedCategory={selectedCategory}
              />
            )
          },
        )}
    </PostListWrapper>
  )
}

export default PostList
