import React, { FunctionComponent } from 'react'
import { Global, css } from '@emotion/react'

const defaultStyle = css`
  @import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap');
  @font-face {
    font-family: 'Spoqa Han Sans Bold';
    font-weight: 700;
    src: local('Spoqa Han Sans'), url('/fonts/Spoqa Han Sans Bold.ttf');
  }

  @font-face {
    font-family: 'Spoqa Han Sans Regular';
    font-weight: 400;
    src: local('Spoqa Han Sans'), url('/fonts/Spoqa Han Sans Regular.ttf');
  }
  * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
    font-family: 'Spoqa Han Sans Regular', serif;
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

  button {
    border: 0;
    outline: 0;
    background-color: transparent;
    cursor: pointer;
  }
`

const GlobalStyle: FunctionComponent = props => {
  return <Global styles={defaultStyle} />
}

export default GlobalStyle
