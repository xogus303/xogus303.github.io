import React, { FunctionComponent, useEffect, useRef } from 'react'
import styled from '@emotion/styled'

import { color } from 'constants/color'

type TableOfContentsProps = {
  html: string | null
}

const Wrapper = styled.nav`
  position: fixed;
  top: 140px;
  left: calc(50% + 432px);
  width: 220px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;

  @media (max-width: 1400px) {
    display: none;
  }
`

const Title = styled.div`
  margin-bottom: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  color: ${color.mutedLight};
`

const TocBody = styled.div`
  font-size: 14px;
  line-height: 1.8;

  ul {
    list-style: none;
    padding-left: 14px;
  }
  > ul {
    padding-left: 0;
  }
  a {
    display: block;
    overflow: hidden;
    color: ${color.muted};
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: 0.15s color;
  }
  a:hover {
    color: ${color.accent};
  }
  a.active {
    font-weight: 700;
    color: ${color.accent};
  }
`

const TableOfContents: FunctionComponent<TableOfContentsProps> = ({
  html,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!html || typeof window === 'undefined') return

    const headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        '#post-content h1[id], #post-content h2[id], #post-content h3[id]',
      ),
    )

    if (headings.length === 0) return

    const setActive = (id: string) => {
      const body = bodyRef.current
      if (!body) return

      body.querySelectorAll('a.active').forEach(el => {
        el.classList.remove('active')
      })

      const target = body.querySelector(`a[href="#${CSS.escape(id)}"]`)
      target?.classList.add('active')
    }

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting)
        if (visible.length > 0) {
          setActive(visible[0].target.id)
        }
      },
      { rootMargin: '-100px 0px -70% 0px' },
    )

    headings.forEach(heading => observer.observe(heading))

    return () => observer.disconnect()
  }, [html])

  if (!html) return null

  return (
    <Wrapper>
      <Title>ON THIS PAGE</Title>
      <TocBody ref={bodyRef} dangerouslySetInnerHTML={{ __html: html }} />
    </Wrapper>
  )
}

export default TableOfContents
