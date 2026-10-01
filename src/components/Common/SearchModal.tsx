import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import styled from '@emotion/styled'
import { Link, useStaticQuery, graphql } from 'gatsby'
import Fuse from 'fuse.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

import { SearchPostItemType } from 'types/PostItem.types'
import { color } from 'constants/color'

type SearchModalProps = {
  isOpen: boolean
  onClose: () => void
}

const Backdrop = styled.div`
  z-index: 10;
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  padding-top: 12vh;
  background: rgba(20, 22, 26, 0.5);

  @media (max-width: 768px) {
    padding-top: 0;
  }
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  margin: 0 20px;
  border-radius: 16px;
  background: ${color.white};
  box-shadow: 0 24px 48px rgba(20, 22, 26, 0.24);
  overflow: hidden;

  @media (max-width: 768px) {
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }
`

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid ${color.border};
`

const Input = styled.input`
  flex: 1;
  border: 0;
  outline: 0;
  font-size: 16px;
  color: ${color.ink};

  &::placeholder {
    color: ${color.mutedLight};
  }
`

const CloseButton = styled.button`
  display: flex;
  color: ${color.muted};

  &:hover {
    color: ${color.ink};
  }
`

const ResultList = styled.div`
  overflow-y: auto;
`

const ResultItem = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 20px;

  &:hover {
    background: ${color.bgAlt};
  }
`

const ResultTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${color.ink};
`

const ResultMeta = styled.div`
  font-size: 13px;
  color: ${color.muted};
`

const ResultTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 2px;
`

const ResultTagItem = styled.div`
  font-size: 12px;
  color: ${color.mutedLight};
`

const EmptyState = styled.div`
  padding: 40px 20px;
  color: ${color.mutedLight};
  font-size: 14px;
  text-align: center;
`

const SearchModal: FunctionComponent<SearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { allMarkdownRemark } = useStaticQuery(
    graphql`
      query searchablePosts {
        allMarkdownRemark(
          sort: [{ frontmatter: { date: DESC } }]
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
                tags
              }
            }
          }
        }
      }
    `,
  )

  const posts: SearchPostItemType[] = allMarkdownRemark.edges

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: [
          { name: 'node.frontmatter.title', weight: 2 },
          { name: 'node.frontmatter.tags', weight: 1.5 },
          { name: 'node.frontmatter.categories', weight: 1 },
          { name: 'node.frontmatter.summary', weight: 0.5 },
        ],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [posts],
  )

  const results = useMemo(() => {
    if (query.trim() === '') return []
    return fuse.search(query).map(result => result.item)
  }, [fuse, query])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    } else {
      setQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <Backdrop
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <Panel>
        <InputRow>
          <FontAwesomeIcon icon={faMagnifyingGlass} color={color.muted} />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="글 제목, 태그, 카테고리로 검색"
          />
          <CloseButton onClick={onClose} aria-label="검색 닫기">
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </CloseButton>
        </InputRow>
        <ResultList>
          {query.trim() !== '' && results.length === 0 && (
            <EmptyState>검색 결과가 없습니다.</EmptyState>
          )}
          {results.map(
            ({
              node: {
                id,
                fields: { slug },
                frontmatter: { title, date, categories, tags },
              },
            }) => (
              <ResultItem key={id} to={slug} onClick={onClose}>
                <ResultTitle>{title}</ResultTitle>
                <ResultMeta>
                  {categories.join(' / ')} · {date}
                </ResultMeta>
                {tags && tags.length > 0 && (
                  <ResultTags>
                    {tags.map(tag => (
                      <ResultTagItem key={tag}>#{tag}</ResultTagItem>
                    ))}
                  </ResultTags>
                )}
              </ResultItem>
            ),
          )}
        </ResultList>
      </Panel>
    </Backdrop>
  )
}

export default SearchModal
