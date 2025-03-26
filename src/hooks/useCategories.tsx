import { useMemo } from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import queryString, { ParsedQuery } from 'query-string'

import { CategoryListProps } from 'components/Main/CategoryList'
import { PostListItemType } from 'types/PostItem.types'

export const useGetCategories = () => {
  const { allMarkdownRemark } = useStaticQuery(
    graphql`
      query allMarkdownRemark {
        allMarkdownRemark(
          sort: [
            { frontmatter: { date: DESC } }
            { frontmatter: { title: DESC } }
          ]
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
      }
    `,
  )

  return allMarkdownRemark
}

export const useFormatCategory = (edges: PostListItemType[]) => {
  const categoryList = useMemo(
    () =>
      edges.reduce(
        (
          list: CategoryListProps['categoryList'],
          {
            node: {
              frontmatter: { categories },
            },
          },
        ) => {
          categories.forEach((category: string) => {
            if (list[category] === undefined) list[category] = 1
            else list[category]++
            list['All']++
          })

          return list
        },
        { All: 0 },
      ),
    [],
  )

  return categoryList
}

export const useSelectedCategory = (search: string) => {
  const parsed: ParsedQuery<string> = queryString.parse(search)
  const selectedCategory: string =
    typeof parsed.category !== 'string' || !parsed.category
      ? 'All'
      : parsed.category

  return selectedCategory
}
