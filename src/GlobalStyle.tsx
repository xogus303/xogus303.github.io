import React, { FunctionComponent } from 'react'
import { Global, css } from '@emotion/react'

import { color } from 'constants/color'

const defaultStyle = css`
  @font-face {
    font-family: 'Spoqa Han Sans';
    font-weight: 700;
    src: local('Spoqa Han Sans'), url('/fonts/Spoqa Han Sans Bold.ttf');
    font-display: swap;
  }

  @font-face {
    font-family: 'Spoqa Han Sans';
    font-weight: 400;
    src: local('Spoqa Han Sans'), url('/fonts/Spoqa Han Sans Regular.ttf');
    font-display: swap;
  }
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-weight: 400;
    font-family: 'Spoqa Han Sans', sans-serif;
  }

  html,
  body,
  #__gatsby {
    height: 100%;
    background-color: transparent;
  }

  a,
  a:hover {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  strong {
    font-weight: 700;
    font-family: 'Spoqa Han Sans', sans-serif;
  }

  button {
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
  }
  ul {
    li {
      word-wrap: break-word;
    }
  }
  ol {
    margin-top: 1rem;
  }
  * {
    -webkit-tap-highlight-color: transparent;
  }
  pre[class*='language-'] {
    background: ${color.bgAlt};
  }
`

const GlobalStyle: FunctionComponent = props => {
  return <Global styles={defaultStyle} />
}

export default GlobalStyle
