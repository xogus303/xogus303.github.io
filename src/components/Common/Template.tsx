import React, { FunctionComponent, ReactNode } from 'react'
import styled from '@emotion/styled'
import { Helmet } from 'react-helmet'

import GlobalStyle from '../../GlobalStyle'
import Header from 'components/Common/Header'
import Footer from 'components/Common/Footer'

type TemplateProps = {
  title: string
  description: string
  url: string
  image: string | undefined
  children: ReactNode
  isIntro?: boolean
}

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const Template: FunctionComponent<TemplateProps> = function ({
  title,
  description,
  url,
  image,
  children,
  isIntro = false,
}) {
  return (
    <Container>
      <Helmet>
        <title>{title}</title>

        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html;charset=UTF-8" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={title} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {image && <meta name="twitter:image" content={image} />}
        <meta name="twitter:site" content="xogus303" />
        <meta name="twitter:creator" content="xogus303" />

        <meta
          name="google-site-verification"
          content="DjcjzOhTpENBMSkwSxq6cf1gjHEBgCHg9DA7VtORkxY"
        />
        <meta
          name="naver-site-verification"
          content="47a593b7fb0564d8a3dd6920c9bc0f499b7f8316"
        />

        <html lang="ko" />
      </Helmet>
      <GlobalStyle />
      <Header isIntro={isIntro} />
      {children}
      <Footer />
    </Container>
  )
}

export default Template
