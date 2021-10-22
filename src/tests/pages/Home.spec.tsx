import { render, screen } from '@testing-library/react'
import {mocked} from 'ts-jest/utils'

import {stripe} from '../../services/stripe'
import Home, { getStaticProps } from '../../pages/index'


jest.mock('../../services/stripe')
jest.mock('next/router')
jest.mock('next-auth/client',()=>{
    return {
        useSession: () => [null, false]
    }
})

describe('Home page', ()=>{
    it('renders correctly', async ()=>{
        render(<Home product={{priceId: 'fake-price-id', amount:'R$10,00'}}/>)

        expect(screen.getByText("for R$10,00 month")).toBeInTheDocument()
    })

    it('loads initial data', async ()=> {
        const retrieveStripePricesMocked = mocked(stripe.prices.retrieve)
        retrieveStripePricesMocked.mockResolvedValueOnce(
            {
                id: 'fake-price-id',
                unit_amount: 1000
            } as any)
        const response = await getStaticProps({})
        console.log(response);
        expect(response).toEqual(
            expect.objectContaining({
                props:{
                    product:{
                        priceId: 'fake-price-id',
                        amount: '$10.00'
                    }
                }
            })
        )
    })
})