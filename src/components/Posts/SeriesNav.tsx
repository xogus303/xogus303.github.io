import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { Link } from 'gatsby'

import { SeriesPostItemType } from 'types/PostItem.types'
import { GatsbyLinkProps } from 'components/Main/CategoryList'
import { color } from 'constants/color'

type SeriesNavProps = {
  series: string
  currentSlug: string
  posts: SeriesPostItemType[]
}

const SeriesNavWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 0 auto 100px;
  max-width: 768px;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`

const SeriesListBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 25px;
  border: 1px solid ${color.border};
  border-radius: 16px;
  background: ${color.bgAlt};
`

const SeriesListHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`

const SeriesListTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${color.ink};
`

const SeriesArchiveLink = styled(Link)`
  font-size: 13px;
  font-weight: 400;
  color: ${color.muted};

  &:hover {
    color: ${color.accent};
    text-decoration: underline;
  }
`

const SeriesListItem = styled(({ active, ...props }: GatsbyLinkProps) => (
  <Link {...props} />
))`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  font-size: 15px;
  font-weight: ${({ active }) => (active ? 700 : 400)};
  color: ${({ active }) => (active ? color.accent : color.muted)};
  word-break: keep-all;

  &:hover {
    color: ${color.accent};
  }
`

const SeriesListIndex = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${color.accent};
  color: ${color.white};
  font-size: 11px;
`

const PrevNextWrapper = styled.div`
  display: flex;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const PrevLinkBox = styled(Link)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 15px 20px;
  border: 1px solid ${color.border};
  border-radius: 16px;
  text-align: left;
  transition: 0.2s border-color;

  &:hover {
    border-color: ${color.accent};
  }
`

const NextLinkBox = styled(PrevLinkBox)`
  align-items: flex-end;
  text-align: right;
`

const PrevNextLabel = styled.div`
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: 400;
  color: ${color.mutedLight};
`

const PrevNextTitle = styled.div`
  overflow: hidden;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
  font-weight: 700;
  color: ${color.ink};
`

const SeriesNav: FunctionComponent<SeriesNavProps> = ({
  series,
  currentSlug,
  posts,
}) => {
  if (!series || posts.length <= 1) return null

  const currentIndex = posts.findIndex(
    ({ node }) => node.fields.slug === currentSlug,
  )
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null
  const nextPost =
    currentIndex >= 0 && currentIndex < posts.length - 1
      ? posts[currentIndex + 1]
      : null

  return (
    <SeriesNavWrapper>
      <SeriesListBox>
        <SeriesListHead>
          <SeriesListTitle>
            {series} ({currentIndex + 1}/{posts.length})
          </SeriesListTitle>
          <SeriesArchiveLink to={`/series/${series}/`}>
            시리즈 전체보기
          </SeriesArchiveLink>
        </SeriesListHead>
        {posts.map(
          (
            {
              node: {
                id,
                fields: { slug },
                frontmatter: { title },
              },
            },
            index,
          ) => (
            <SeriesListItem key={id} to={slug} active={slug === currentSlug}>
              <SeriesListIndex>{index + 1}</SeriesListIndex>
              {title}
            </SeriesListItem>
          ),
        )}
      </SeriesListBox>
      <PrevNextWrapper>
        {prevPost && (
          <PrevLinkBox to={prevPost.node.fields.slug}>
            <PrevNextLabel>이전편</PrevNextLabel>
            <PrevNextTitle>{prevPost.node.frontmatter.title}</PrevNextTitle>
          </PrevLinkBox>
        )}
        {nextPost && (
          <NextLinkBox to={nextPost.node.fields.slug}>
            <PrevNextLabel>다음편</PrevNextLabel>
            <PrevNextTitle>{nextPost.node.frontmatter.title}</PrevNextTitle>
          </NextLinkBox>
        )}
      </PrevNextWrapper>
    </SeriesNavWrapper>
  )
}

export default SeriesNav
