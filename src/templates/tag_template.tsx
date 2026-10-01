import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { graphql } from 'gatsby'

import Template from 'components/Common/Template'
import PostItem from 'components/Main/PostItem'
import { PostListItemType } from 'types/PostItem.types'
import { color } from 'constants/color'

type TagTemplateProps = {
  location: {
    href: string
  }
  pageContext: {
    tag: string
  }
  data: {
    site: {
      siteMetadata: {
        title: string
      }
    }
    allMarkdownRemark: {
      edges: PostListItemType[]
    }
  }
}

const TagListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1100px;
  margin: 0 auto;
  padding: 140px 0 100px;

  @media (max-width: 1080px) {
    padding: 110px 20px 70px;
  }

  @media (max-width: 768px) {
    padding: 100px 20px 70px;
  }
`

const TagLabel = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${color.accent};
`

const TagTitle = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${color.ink};
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`

const TagCount = styled.div`
  margin: 10px 0 40px;
  font-size: 15px;
  color: ${color.muted};
`

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 3em;

  @media (max-width: 1080px) {
    grid-template-columns: 1fr 1fr;
    grid-gap: 2% 5%;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-gap: 1% 2%;
    width: 100%;
  }
`

const TagTemplate: FunctionComponent<TagTemplateProps> = function ({
  location: { href },
  pageContext: { tag },
  data: {
    site: {
      siteMetadata: { title },
    },
    allMarkdownRemark: { edges },
  },
}) {
  return (
    <Template
      title={`#${tag} - ${title}`}
      description={`'#${tag}' 태그가 달린 전체 글 목록입니다.`}
      url={href}
      image={undefined}
    >
      <TagListWrapper>
        <TagLabel>TAG</TagLabel>
        <TagTitle>#{tag}</TagTitle>
        <TagCount>총 {edges.length}개의 글</TagCount>
        <TagGrid>
          {edges.map(
            ({
              node: {
                id,
                fields: { slug },
                frontmatter,
              },
            }) => (
              <PostItem
                {...frontmatter}
                link={slug}
                key={id}
                selectedCategory="All"
              />
            ),
          )}
        </TagGrid>
      </TagListWrapper>
    </Template>
  )
}

export default TagTemplate

export const queryTagPosts = graphql`
  query queryTagPosts($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { tags: { in: [$tag] } } }
      sort: [{ frontmatter: { date: DESC } }, { frontmatter: { title: DESC } }]
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            series
            summary
            date(formatString: "YYYY.MM.DD")
            categories
            tags
            thumbnail {
              childImageSharp {
                gatsbyImageData(width: 768, height: 400)
              }
            }
          }
        }
      }
    }
  }
`
