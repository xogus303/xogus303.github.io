import { IGatsbyImageData } from 'gatsby-plugin-image'

export type PostFrontmatterType = {
  title: string
  series: string
  summary: string
  date: string
  categories: string[]
  tags?: string[]
  thumbnail: {
    childImageSharp: {
      gatsbyImageData?: IGatsbyImageData
    }
    publicURL: string
  }
}

export type PostListItemType = {
  node: {
    id: string
    fields: {
      slug: string
    }
    frontmatter: PostFrontmatterType
  }
}

export type SeriesPostItemType = {
  node: {
    id: string
    fields: {
      slug: string
    }
    frontmatter: {
      title: string
    }
  }
}

export type SearchPostItemType = {
  node: {
    id: string
    fields: {
      slug: string
    }
    frontmatter: {
      title: string
      summary: string
      date: string
      categories: string[]
      tags?: string[]
    }
  }
}
