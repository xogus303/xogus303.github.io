import React, { FunctionComponent, useEffect, useState } from 'react'
import { graphql } from 'gatsby'

import Template from 'components/Common/Template'
import PostHead from 'components/Posts/PostHead'
import { PostFrontmatterType, SeriesPostItemType } from 'types/PostItem.types'
import PostContent from 'components/Posts/PostContent'
import CommentWidget from 'components/Posts/CommentWidget'
import PostScrollIndicator from 'components/Posts/PostScrollIndicator'
import SeriesNav from 'components/Posts/SeriesNav'
import TableOfContents from 'components/Posts/TableOfContents'

export type PostPageItemType = {
  node: {
    html: string
    tableOfContents: string | null
    timeToRead: number
    frontmatter: PostFrontmatterType
  }
}

type PostTemplateProps = {
  data: {
    allMarkdownRemark: {
      edges: PostPageItemType[]
    }
    seriesPosts: {
      edges: SeriesPostItemType[]
    }
  }
  location: {
    href: string
  }
  pageContext: {
    slug: string
  }
}

const PostTemplate: FunctionComponent<PostTemplateProps> = function ({
  data: {
    allMarkdownRemark: { edges },
    seriesPosts,
  },
  location: { href },
  pageContext: { slug: currentSlug },
}) {
  const {
    node: {
      html,
      tableOfContents,
      timeToRead,
      frontmatter: {
        title,
        series,
        summary,
        date,
        categories,
        tags,
        thumbnail,
        thumbnailOrigin,
      },
    },
  } = edges[0]

  const [pageHeight, setPageHeight] = useState<number>(0)
  const [scrollY, setScrollY] = useState<number>(0)
  const handleScrollIndicator = () => {
    setScrollY(window.pageYOffset)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScrollIndicator)
    return () => {
      window.removeEventListener('scroll', handleScrollIndicator)
    }
  }, [])

  useEffect(
    () => {
      if (typeof window !== 'undefined') {
        setPageHeight(document.body.scrollHeight - document.body.clientHeight)
      }
    },
    typeof window !== 'undefined'
      ? [document?.body.scrollHeight, document.body.clientHeight]
      : [],
  )

  const scrollGauge = (scrollY * 100) / pageHeight
  return (
    <Template
      title={`${series !== '' ? series + ' - ' : ''}${title}`}
      description={summary}
      url={href}
      image={thumbnail?.publicURL}
    >
      <PostScrollIndicator widthPercent={scrollGauge} />
      <PostHead
        title={title}
        series={series}
        date={date}
        categories={categories}
        tags={tags}
        readingTime={timeToRead}
        thumbnail={thumbnail?.childImageSharp?.gatsbyImageData}
        thumbnailOrigin={thumbnailOrigin}
      />
      <TableOfContents html={tableOfContents} />
      <PostContent html={html} />
      <SeriesNav
        series={series}
        currentSlug={currentSlug}
        posts={seriesPosts.edges}
      />
      <CommentWidget />
    </Template>
  )
}

export default PostTemplate

export const queryMarkdownDataBySlug = graphql`
  query queryMarkdownDataBySlug($slug: String, $series: String) {
    allMarkdownRemark(filter: { fields: { slug: { eq: $slug } } }) {
      edges {
        node {
          html
          tableOfContents(maxDepth: 3)
          timeToRead
          frontmatter {
            title
            series
            summary
            date(formatString: "YYYY.MM.DD")
            categories
            tags
            thumbnail {
              childImageSharp {
                gatsbyImageData
              }
              publicURL
            }
            thumbnailOrigin
          }
        }
      }
    }
    seriesPosts: allMarkdownRemark(
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
          }
        }
      }
    }
  }
`
