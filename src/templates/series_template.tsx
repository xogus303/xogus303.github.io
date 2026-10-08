import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { graphql } from 'gatsby'

import Template from 'components/Common/Template'
import PostItem from 'components/Main/PostItem'
import { PostListItemType } from 'types/PostItem.types'
import { color } from 'constants/color'

type SeriesTemplateProps = {
  location: {
    href: string
  }
  pageContext: {
    series: string
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

const SeriesListWrapper = styled.div`
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

const SeriesLabel = styled.div`
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${color.accent};
`

const SeriesTitle = styled.div`
  font-size: 36px;
  font-weight: 700;
  color: ${color.ink};
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 26px;
  }
`

const SeriesCount = styled.div`
  margin: 10px 0 40px;
  font-size: 15px;
  color: ${color.muted};
`

const SeriesGrid = styled.div`
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

const SeriesTemplate: FunctionComponent<SeriesTemplateProps> = function ({
  location: { href },
  pageContext: { series },
  data: {
    site: {
      siteMetadata: { title },
    },
    allMarkdownRemark: { edges },
  },
}) {
  return (
    <Template
      title={`${series} - ${title}`}
      description={`'${series}' 시리즈의 전체 글 목록입니다.`}
      url={href}
      image={undefined}
    >
      <SeriesListWrapper>
        <SeriesLabel>SERIES</SeriesLabel>
        <SeriesTitle>{series}</SeriesTitle>
        <SeriesCount>총 {edges.length}개의 글</SeriesCount>
        <SeriesGrid>
          {edges.map(
            (
              {
                node: {
                  id,
                  fields: { slug },
                  frontmatter,
                },
              },
              index,
            ) => (
              <PostItem
                {...frontmatter}
                link={slug}
                key={id}
                selectedCategory="All"
                seriesIndex={index}
                seriesTotal={edges.length}
              />
            ),
          )}
        </SeriesGrid>
      </SeriesListWrapper>
    </Template>
  )
}

export default SeriesTemplate

export const querySeriesPosts = graphql`
  query querySeriesPosts($series: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { series: { eq: $series } } }
      sort: [{ frontmatter: { date: ASC } }, { frontmatter: { title: ASC } }]
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
