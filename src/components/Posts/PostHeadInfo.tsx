import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { navigate, Link } from 'gatsby'

import { color } from 'constants/color'

export type PostHeadInfoProps = {
  title: string
  series: string
  date: string
  categories: string[]
  tags?: string[]
  readingTime?: number
  seriesIndex?: number
  seriesTotal?: number
}

const PostHeadInfoWrapper = styled.div`
  display: flex;
  max-width: 1100px;
  width: 100%;
  margin: 0 auto 0;
  padding: 86px 0 40px 0;

  @media (max-width: 768px) {
    width: 100%;
    padding: 40px 20px;
  }
`
const PrevPageIcon = styled.div`
  display: grid;
  position: fixed;
  top: 10%;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${color.border};
  background: ${color.white};
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 8px 24px ${color.shadow};
  transition: 0.2s box-shadow;

  &:hover {
    box-shadow: 0 8px 24px rgba(20, 22, 26, 0.14);
  }

  @media (max-width: 768px) {
    display: none;
  }
`
const PostHeadInfoWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto 0;
  max-width: 768px;
  width: 100%;

  @media (max-width: 768px) {
    width: 100%;
  }
`
const Title = styled.div`
  display: -webkit-box;
  overflow: hidden;
  overflow-wrap: break-word;
  margin-top: auto;
  text-overflow: ellipsis;
  white-space: normal;
  -webkit-box-orient: vertical;
  font-size: 45px;
  font-weight: 700;
  color: ${color.ink};
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 30px;
  }
`
const Series = styled(Title)`
  color: ${color.accent};
  font-size: 30px;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`
const SeriesOrder = styled.span`
  font-size: 18px;
  font-weight: 400;
  color: ${color.muted};

  @media (max-width: 768px) {
    font-size: 14px;
  }
`
const PostData = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10%;
  font-size: 18px;
  font-weight: 700;
  color: ${color.muted};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    font-size: 15px;
    font-weight: 400;
  }
`

const ReadingTime = styled.div`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  color: ${color.mutedLight};
`

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
`

const TagItem = styled(Link)`
  font-size: 14px;
  font-weight: 700;
  color: ${color.muted};

  &:hover {
    color: ${color.accent};
  }
`

const PostHeadInfo: FunctionComponent<PostHeadInfoProps> = ({
  title,
  series,
  date,
  categories,
  tags,
  readingTime,
  seriesIndex,
  seriesTotal,
}) => {
  const showSeriesOrder =
    !!series &&
    typeof seriesIndex === 'number' &&
    seriesIndex >= 0 &&
    typeof seriesTotal === 'number' &&
    seriesTotal > 1
  const goBackPage = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <PostHeadInfoWrapper>
      <PrevPageIcon onClick={goBackPage}>
        <FontAwesomeIcon icon={faArrowLeft} color={color.ink} />
      </PrevPageIcon>
      <PostHeadInfoWrap>
        <Series>
          {series}
          {showSeriesOrder && (
            <SeriesOrder>
              {' '}
              ({(seriesIndex as number) + 1}/{seriesTotal})
            </SeriesOrder>
          )}
        </Series>
        <Title>{title}</Title>
        <PostData>
          <div>{categories.join(' / ')}</div>
          <div>{date}</div>
        </PostData>
        {typeof readingTime === 'number' && (
          <ReadingTime>{readingTime}분 읽기</ReadingTime>
        )}
        {tags && tags.length > 0 && (
          <TagRow>
            {tags.map(tag => (
              <TagItem key={tag} to={`/tags/${tag}/`}>
                #{tag}
              </TagItem>
            ))}
          </TagRow>
        )}
      </PostHeadInfoWrap>
    </PostHeadInfoWrapper>
  )
}

export default PostHeadInfo
