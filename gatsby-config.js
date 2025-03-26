module.exports = {
  siteMetadata: {
    title: `나의 개발 블로그`,
    description: `프론트엔드 개발자 김태현의 블로그 입니다.`,
    author: `thKim`,
    siteUrl: `https://xogus303.github.io/`,
    image: '/static/TH.png',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-typescript',
      options: {
        isTSX: true,
        allExtensions: true,
      },
    },
    `gatsby-plugin-emotion`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `contents`,
        path: `${__dirname}/contents`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/static`,
      },
    },
    {
      // Markdown Parser 역할, 마크다운 문법을 HTML 형태로 변환해주어 띄워줌
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: 'gatsby-remark-smartypants',
            options: {
              dashes: 'oldschool',
            },
          },
          {
            // 문법 하이라이팅 역할, 소스코드를 실제 IDE에서 보는 것처럼 변환
            resolve: 'gatsby-remark-prismjs',
            options: {
              classPrefix: 'language-',
            },
          },
          {
            // 마크다운 문서 내에서의 이미지 사용 최적화, 반응형 이미지 생성, 동적 로딩 등 다양한 기능
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: 768,
              quality: 100,
              withWebp: true,
            },
          },
          {
            // 마크다운 내에서 사용되는 이미지를 특정 디렉토리로 복사해줌, 일반적으로 루트 디렉토리의 public 디렉토리에 이미지 복사됨
            resolve: 'gatsby-remark-copy-linked-files',
            options: {},
          },
          {
            // 마크다운 내에서 사용되는 링크 태그의 target, rel 등의 속성을 지정해주는 기능 제공
            resolve: 'gatsby-remark-external-links',
            options: {
              target: '_blank',
              rel: 'nofollow',
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        defaults: {
          formats: ['auto', 'webp'],
          quality: 100,
          placeholder: 'blurred',
        },
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-image`,
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: 'https://xogus303.github.io/',
        stripQueryString: true,
      },
    },
    'gatsby-plugin-sitemap',
    {
      resolve: 'gatsby-plugin-robots-txt',
      options: {
        policy: [{ userAgent: '*', allow: '/' }],
      },
    },
    {
      resolve: 'gatsby-plugin-favicons',
      options: {
        logo: './static/favicon.ico',
        appName: 'My Blog',
        icons: {
          android: true,
          appleIcon: true,
          appleStartup: true,
          coast: false,
          favicons: true,
          yandex: false,
          windows: false,
        },
      },
    },
  ],
}
