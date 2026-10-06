import React, { FunctionComponent, useEffect, useRef } from 'react'
import styled from '@emotion/styled'

import { color } from 'constants/color'

interface PostContentProps {
  html: string
}

const COPY_BUTTON_LABEL = '복사'
const COPY_BUTTON_DONE_LABEL = '복사됨'

const MarkdownRenderer = styled.div`
  display: flex;
  flex-direction: column;
  width: 768px;
  margin: 0 auto;
  padding: 100px 0;
  word-break: keep-all;

  line-height: 1.8;
  font-size: 16px;
  font-weight: 400;

  p,
  li {
    color: ${color.text};
  }

  p {
    margin: 22px 0;
  }
  p:first-of-type {
    margin-top: 0;
  }

  h1,
  h2,
  h3,
  h4 {
    font-weight: 700;
  }

  * + h1 {
    margin-top: 80px;
  }
  * + h2 {
    margin-top: 30px;
  }
  * + h3 {
    margin-top: 20px;
  }
  * + h4 {
    margin-top: 16px;
  }
  hr + h1,
  hr + h2,
  hr + h3,
  hr + h4 {
    margin-top: 0;
  }

  h1 {
    font-size: 36px;
  }

  h2 {
    font-size: 28px;
  }

  h3 {
    font-size: 20px;
  }

  h4 {
    font-size: 17px;
  }

  // 토스 기술 블로그 "aside" 스타일 참고 — 순서가 중요한 단계·목록을 코드블록이
  // 아닌 별도 카드로 보여줄 때 사용(복사 버튼 불필요, 문단형 목록과도 구분됨)
  .post-aside {
    margin: 30px 0;
    padding: 28px 32px;
    background: ${color.bgAlt};
    border-radius: 16px;
  }
  .post-aside ol {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: 0;
    padding-left: 22px;
  }
  .post-aside li {
    line-height: 1.6;
  }
  .post-aside li::marker {
    color: ${color.ink};
    font-weight: 700;
  }
  .post-aside strong {
    color: ${color.ink};
  }

  // 고정 헤더에 가려지지 않도록 앵커 이동 시 여유 공간 확보
  h1[id],
  h2[id],
  h3[id] {
    scroll-margin-top: 100px;
  }

  // Adjust Quotation Element Style
  blockquote {
    margin: 30px 0;
    padding: 5px 15px;
    border-left: 2px solid ${color.accent};
    font-weight: 700;
  }

  // Adjust List Element Style
  ol,
  ul {
    margin-left: 20px;
  }

  // Adjust Horizontal Rule style
  hr {
    border: 1px solid ${color.border};
    margin: 100px 0;
  }

  // Adjust Link Element Style
  a {
    color: ${color.accent};
    text-decoration: underline;
  }

  // Heading Anchor Link (gatsby-remark-autolink-headers)
  h1,
  h2,
  h3 {
    position: relative;
  }
  .post-heading-anchor {
    position: absolute;
    top: 50%;
    left: -28px;
    display: inline-flex;
    opacity: 0;
    color: ${color.accent};
    transform: translateY(-50%);
    transition: 0.15s opacity;

    svg {
      fill: currentColor;
    }
  }
  h1:hover .post-heading-anchor,
  h2:hover .post-heading-anchor,
  h3:hover .post-heading-anchor {
    opacity: 1;
  }

  // Adjust Code Style
  pre[class*='language-'] {
    position: relative;
    padding: 15px;
    font-size: 15px;

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.5);
      border-radius: 3px;
    }
  }

  .post-code-copy-button {
    display: flex;
    align-items: center;
    gap: 6px;
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 6px 12px;
    border: 1px solid rgba(20, 22, 26, 0.3);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    color: ${color.ink};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.15s background, 0.15s border-color, 0.15s color;
  }
  .post-code-copy-button:hover {
    background: ${color.white};
    border-color: ${color.accent};
    color: ${color.accent};
  }
  .post-code-copy-button svg {
    flex-shrink: 0;
  }

  code[class*='language-'],
  pre[class*='language-'] {
    tab-size: 2;
    white-space: break-spaces;
  }

  table {
    border: 0.5px solid ${color.border};
    border-radius: 4px;
    border-spacing: 0;
  }
  table th {
    color: ${color.muted};
  }
  table th,
  table td {
    padding: 5px;
    border: 0.5px solid ${color.border};
  }

  span.desc {
    color: ${color.muted};
  }

  // Markdown Responsive Design
  @media (max-width: 768px) {
    width: 100%;
    padding: 80px 20px;
    line-height: 1.6;
    font-size: 14px;

    h1 {
      font-size: 26px;
    }

    h2 {
      font-size: 21px;
    }

    h3 {
      font-size: 17px;
    }

    h4 {
      font-size: 15px;
    }

    img {
      width: 100%;
    }

    hr {
      margin: 50px 0;
    }

    .post-aside {
      padding: 20px 20px;
      border-radius: 12px;
    }

    .post-heading-anchor {
      display: none;
    }
  }
`

const PostContent: FunctionComponent<PostContentProps> = ({ html }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const codeBlocks = Array.from(
      container.querySelectorAll<HTMLPreElement>('pre[class*="language-"]'),
    )

    const cleanups: Array<() => void> = []

    codeBlocks.forEach(pre => {
      const code = pre.querySelector('code')
      if (!code) return

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'post-code-copy-button'
      button.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span></span>'

      const label = button.querySelector('span') as HTMLSpanElement
      label.textContent = COPY_BUTTON_LABEL

      let resetTimer: ReturnType<typeof setTimeout>
      const handleClick = () => {
        navigator.clipboard
          .writeText(code.innerText)
          .then(() => {
            label.textContent = COPY_BUTTON_DONE_LABEL
            clearTimeout(resetTimer)
            resetTimer = setTimeout(() => {
              label.textContent = COPY_BUTTON_LABEL
            }, 1500)
          })
          .catch(() => {})
      }

      button.addEventListener('click', handleClick)
      pre.appendChild(button)

      cleanups.push(() => {
        clearTimeout(resetTimer)
        button.removeEventListener('click', handleClick)
        button.remove()
      })
    })

    return () => cleanups.forEach(cleanup => cleanup())
  }, [html])

  return (
    <MarkdownRenderer
      id="post-content"
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export default PostContent
