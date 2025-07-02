import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { navigate } from 'gatsby'

export type PostHeadInfoProps = {
  title: string
  series: string
  date: string
  categories: string[]
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
  border: 1px solid #aaa;
  background: #666;
  color: #000;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);

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
  font-weight: 800;
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: 30px;
  }
`
const Series = styled(Title)`
  color: #777;
  font-size: 30px;

  @media (max-width: 768px) {
    font-size: 22px;
  }
`
const PostData = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10%;
  font-size: 18px;
  font-weight: 700;
  color: #aaa;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    font-size: 15px;
    font-weight: 400;
  }
`

const PostHeadInfo: FunctionComponent<PostHeadInfoProps> = ({
  title,
  series,
  date,
  categories,
}) => {
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
        <FontAwesomeIcon icon={faArrowLeft} color={'#fff'} />
      </PrevPageIcon>
      <PostHeadInfoWrap>
        <Series>{series}</Series>
        <Title>{title}</Title>
        <PostData>
          <div>{categories.join(' / ')}</div>
          <div>{date}</div>
        </PostData>
      </PostHeadInfoWrap>
    </PostHeadInfoWrapper>
  )
}

export default PostHeadInfo
