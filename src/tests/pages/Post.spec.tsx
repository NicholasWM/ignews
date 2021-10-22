import { render, screen } from '@testing-library/react'
import { getSession, useSession } from 'next-auth/client'
import {mocked} from 'ts-jest/utils'

import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getPrismicClient } from '../../services/prismic'

const post = {
    slug: 'my-new-post',
    title: 'My New Post',
    content: '<p>Post Excerpt</p>',
    updatedAt: '10 de abril de 2021',
}

jest.mock('next-auth/client')

jest.mock('../../services/prismic')

describe('Home page', ()=>{
    it('renders correctly', async ()=>{
        render(<Post post={post} />)

        expect(screen.getByText(post.title)).toBeInTheDocument()
        expect(screen.getByText("Post Excerpt")).toBeInTheDocument()
    })

    it('redirects user if no subscription is found', async ()=> {
        const getSessionMocked = mocked(getSession)
        
        getSessionMocked.mockResolvedValueOnce(null)

        const response = await getServerSideProps({
            params: {
                slug: post.slug
            }
        } as any)
        
        expect(response).toEqual(
            expect.objectContaining({
                redirect: expect.objectContaining({
                    destination: '/',
                })
            })
        )
    })

    it('load initial data', async ()=>{
        const getSessionMocked = mocked(getSession)
        
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

        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active-subscription'
        } as any)

        const response = await getServerSideProps({
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