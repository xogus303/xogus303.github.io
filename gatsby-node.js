const path = require('path')
const { createFilePath } = require(`gatsby-source-filesystem`)

// Setup Import Alias
exports.onCreateWebpackConfig = ({ getConfig, actions }) => {
  const output = getConfig().output || {}

  actions.setWebpackConfig({
    output,
    resolve: {
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        utils: path.resolve(__dirname, 'src/utils'),
        hooks: path.resolve(__dirname, 'src/hooks'),
        constants: path.resolve(__dirname, 'src/constants'),
        types: path.resolve(__dirname, 'src/types'),
      },
    },
  })
}

// Generate a Slug Each Post Data
exports.onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode })

    createNodeField({ node, name: 'slug', value: slug })
  }
}

// Generate Post Page Through Markdown Data
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  // Get All Markdown File For Paging
  const queryAllMarkdownData = await graphql(`
    {
      allMarkdownRemark(
        sort: [
          { frontmatter: { date: DESC } }
          { frontmatter: { title: DESC } }
        ]
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              series
              tags
            }
          }
        }
      }
    }
  `)

  // Handling GraphQL Query Error
  if (queryAllMarkdownData.errors) {
    reporter.panicOnBuild(`Error while running query`)
    return
  }

  const { edges } = queryAllMarkdownData.data.allMarkdownRemark

  // Import Post Template Component
  const PostTemplateComponent = path.resolve(
    __dirname,
    'src/templates/post_template.tsx',
  )

  // Import Series Template Component
  const SeriesTemplateComponent = path.resolve(
    __dirname,
    'src/templates/series_template.tsx',
  )

  // Import Tag Template Component
  const TagTemplateComponent = path.resolve(
    __dirname,
    'src/templates/tag_template.tsx',
  )

  // Page Generating Function
  const generatePostPage = ({
    node: {
      fields: { slug },
      frontmatter: { series },
    },
  }) => {
    const pageOptions = {
      path: slug,
      component: PostTemplateComponent,
      context: { slug, series: series || '' },
    }

    createPage(pageOptions)
  }

  // Generate Post Page And Passing Slug Props for Query
  edges.forEach(generatePostPage)

  // Collect Unique Series Names
  const seriesNameSet = new Set(
    edges
      .map(({ node }) => node.frontmatter.series)
      .filter(series => series && series.trim() !== ''),
  )

  // Generate Series Archive Page For Each Series
  seriesNameSet.forEach(series => {
    createPage({
      path: `/series/${series}/`,
      component: SeriesTemplateComponent,
      context: { series },
    })
  })

  // Collect Unique Tag Names
  const tagNameSet = new Set(
    edges.flatMap(({ node }) => node.frontmatter.tags || []),
  )

  // Generate Tag Archive Page For Each Tag
  tagNameSet.forEach(tag => {
    createPage({
      path: `/tags/${tag}/`,
      component: TagTemplateComponent,
      context: { tag },
    })
  })
}
