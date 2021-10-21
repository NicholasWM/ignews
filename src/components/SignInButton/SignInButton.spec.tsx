import {render, screen} from '@testing-library/react'
import {useSession} from 'next-auth/client'
import {mocked} from 'ts-jest/utils'
import { SignInButton } from '.'

jest.mock('next-auth/client')

describe('Signin Button', ()=>{

    it('renders correctly when user is not authenticated', ()=>{
        const useSessionMocked = mocked(useSession)
        useSessionMocked.mockReturnValueOnce([null, false]) // Once mocka apenas o proximo retorno
        render(
            <SignInButton/>
        )
    
        expect(screen.getByText('Sign In with Github')).toBeInTheDocument()
    })
    it('renders correctly when user is authenticated', ()=>{
        const useSessionMocked = mocked(useSession)
        useSessionMocked.mockReturnValueOnce([
            {user: {name: 'John Doe', email: 'john.doe@example.com'}, expires: 'fake-expires'}
        , false])
        render(<SignInButton/>)
            
        expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
})

