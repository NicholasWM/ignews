import { render, screen } from '@testing-library/react'
import {mocked} from 'ts-jest/utils'

import Posts, { getStaticProps } from '../../pages/posts'
import { getPrismicClient } from '../../services/prismic'

const posts = [
    {
        slug: 'my-new-post',
        title: 'My New Post',
        excerpt: 'Post Excerpt',
        updatedAt: '10 de abril de 2021',
    }
]

jest.mock('../../services/prismic')

describe('Home page', ()=>{
    it('renders correctly', async ()=>{
        render(<Posts posts={posts} />)

        expect(screen.getByText(posts[0].title)).toBeInTheDocument()
    })

    it('loads initial data', async ()=> {
        const getPrismicClientMocked = mocked(getPrismicClient)
        getPrismicClientMocked.mockReturnValueOnce({
            query: jest.fn().mockResolvedValueOnce({
                results: [
                    {
                        uid: "my-new-post",
                        data:{
                            title: [
                                {type: 'heading', text: posts[0].title},
                            ],
                            content: [
                                {type: 'paragraph', text: posts[0].excerpt},
                            ],
                        },
                        last_publication_date: '04-10-2021'
                    },
                ]
            })
        } as any)
        const response = await getStaticProps({})
        expect(response).toEqual(
            expect.objectContaining({
                props:{
                    posts
                }
            })
        )
    })
})