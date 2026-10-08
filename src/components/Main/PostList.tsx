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

  // 전체 posts(페이지네이션·카테고리 필터 적용 전) 기준으로 시리즈별 순번을 미리 계산 —
  // postList(필터링된 부분집합)로 계산하면 필터 상태에 따라 순번이 틀어진다.
  const seriesOrderById = useMemo(() => {
    const bySeries = new Map<string, PostListItemType[]>()
    posts.forEach(post => {
      const series = post.node.frontmatter.series
      if (!series) return
      if (!bySeries.has(series)) bySeries.set(series, [])
      bySeries.get(series)!.push(post)
    })

    const result = new Map<string, { index: number; total: number }>()
    bySeries.forEach(group => {
      const sorted = [...group].sort((a, b) =>
        a.node.frontmatter.date.localeCompare(b.node.frontmatter.date),
      )
      sorted.forEach((post, index) => {
        result.set(post.node.id, { index, total: sorted.length })
      })
    })
    return result
  }, [posts])

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
            const order = seriesOrderById.get(id)
            return (
              <PostItem
                {...frontmatter}
                link={slug}
                key={id}
                selectedCategory={selectedCategory}
                seriesIndex={order?.index}
                seriesTotal={order?.total}
              />
            )
          },
        )}
    </PostListWrapper>
  )
}

export default PostList
