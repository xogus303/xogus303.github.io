import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { graphql } from 'gatsby'
import { IGatsbyImageData } from 'gatsby-plugin-image'

import Template from 'components/Common/Template'
import Introduction from 'components/Main/Introduction'
import PostList from 'components/Main/PostList'
import { PostListItemType } from 'types/PostItem.types'
import { useFormatCategory, useSelectedCategory } from 'hooks/useCategories'

type IndexPageProps = {
  location: {
    search: string
  }
  data: {
    site: {
      siteMetadata: {
        title: string
        description: string
        siteUrl: string
      }
    }
    allMarkdownRemark: {
      edges: PostListItemType[]
    }
    file: {
      childImageSharp: {
        gatsbyImageData: IGatsbyImageData
      }
      publicURL: string
    }
  }
}

const IndexPage: FunctionComponent<IndexPageProps> = function ({
  location: { search },
  data: {
    site: {
      siteMetadata: { title, description, siteUrl },
    },
    allMarkdownRemark: { edges },
    file: {
      childImageSharp: { gatsbyImageData },
      publicURL,
    },
  },
}) {
  console.log('index gatsbyImageData', gatsbyImageData)
  const selectedCategory = useSelectedCategory(search)

  const initIntroState =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('initIntroState')
      : null
  const [isIntro, setIsIntro] = useState<boolean>(
    initIntroState === 'false' ? false : true,
  )

  const hideIntro = useCallback(() => {
    if (isIntro === true) {
      document.body.style.overflow = 'auto'
      setIsIntro(false)
      sessionStorage.setItem('initIntroState', 'false')
    }
  }, [])

  useEffect(() => {
    if (isIntro === true) {
      document.body.style.overflow = 'hidden'
    }
  }, [])

  return (
    <Template
      title={title}
      description={description}
      url={siteUrl}
      image={publicURL}
      isIntro={isIntro}
    >
      <Introduction
        introduceBg={gatsbyImageData}
        isIntro={isIntro}
        hideIntro={hideIntro}
      />
      <PostList selectedCategory={selectedCategory} posts={edges} />
    </Template>
  )
}

export default IndexPage

export const getPostList = graphql`
  query getPostList {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date, frontmatter___title] }
    ) {
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            summary
            date(formatString: "YYYY.MM.DD")
            categories
            thumbnail {
              childImageSharp {
                gatsbyImageData(width: 768, height: 400)
              }
            }
          }
        }
      }
    }
    file(name: { eq: "introduceBg" }) {
      childImageSharp {
        gatsbyImageData
      }
      publicURL
    }
  }
`
