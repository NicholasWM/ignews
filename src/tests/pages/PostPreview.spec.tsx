import { render, screen } from '@testing-library/react'
import { getSession, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import {mocked} from 'ts-jest/utils'

import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post Excerpt</p>',
    updatedAt: '10 de abril de 2021',
}

jest.mock('next-auth/client')
jest.mock('next/router')

jest.mock('../../services/prismic')

describe('Home page', ()=>{
    it('renders correctly', async ()=>{
        const useSessionMocked = mocked(useSession)
        useSessionMocked.mockReturnValueOnce([null, false])
        render(<Post post={post}/>)
        expect(screen.getByText(post.title)).toBeInTheDocument()
        expect(screen.getByText("Post Excerpt")).toBeInTheDocument()
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
    })

    it('redirects user to full post when user is subscribed', async ()=> {
        const useSessionMocked = mocked(useSession)
        const useRouterMocked = mocked(useRouter)
        const pushMock = jest.fn()

        useSessionMocked.mockReturnValueOnce([
            {activeSubscription:'fake-active-subscription'},
            false
        ] as any)

        useRouterMocked.mockReturnValueOnce({
            push: pushMock
        } as any)

        render(<Post post={post}/>)

        expect(pushMock).toHaveBeenCalledWith(`/posts/${post.slug}`)
    })

    it('load initial data', async ()=>{
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        {type: 'heading', text: post.title},
                    ],
                    content: [
                        {type: 'paragraph', text: "Post Excerpt"},
                    ],
                },
                last_publication_date: '04-10-2021'
            })
        } as any)

        const response = await getStaticProps({
            params: {
                slug: post.slug
            }
        } as any)
        
        expect(response).toEqual(
            expect.objectContaining({
                props:{
                    post
                }
            })
        )
    })
})