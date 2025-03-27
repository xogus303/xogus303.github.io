import React, { FunctionComponent, useEffect, useState } from 'react'
import { graphql } from 'gatsby'

import Template from 'components/Common/Template'
import PostHead from 'components/Posts/PostHead'
import { PostFrontmatterType } from 'types/PostItem.types'
import PostContent from 'components/Posts/PostContent'
import CommentWidget from 'components/Posts/CommentWidget'
import PostScrollIndicator from 'components/Posts/PostScrollIndicator'

export type PostPageItemType = {
  node: {
    html: string
    frontmatter: PostFrontmatterType
  }
}

type PostTemplateProps = {
  data: {
    allMarkdownRemark: {
      edges: PostPageItemType[]
    }
  }
  location: {
    href: string
  }
}

const PostTemplate: FunctionComponent<PostTemplateProps> = function ({
  data: {
    allMarkdownRemark: { edges },
  },
  location: { href },
}) {
  const {
    node: {
      html,
      frontmatter: { title, series, summary, date, categories, thumbnail },
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
        thumbnail={thumbnail?.childImageSharp?.gatsbyImageData}
      />
      <PostContent html={html} />
      <CommentWidget />
    </Template>
  )
}

export default PostTemplate

export const queryMarkdownDataBySlug = graphql`
  query queryMarkdownDataBySlug($slug: String) {
    allMarkdownRemark(filter: { fields: { slug: { eq: $slug } } }) {
      edges {
        node {
          html
          frontmatter {
            title
            series
            summary
            date(formatString: "YYYY.MM.DD")
            categories
            thumbnail {
              childImageSharp {
                gatsbyImageData
              }
              publicURL
            }
          }
        }
      }
    }
  }
`
