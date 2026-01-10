'use client'

import { 
  ApolloClient, 
  InMemoryCache
} from '@apollo/client-integration-nextjs'
import { HttpLink } from '@apollo/client'  // Import HttpLink from regular Apollo

export function makeClient() {
  return new ApolloClient({
    link: new HttpLink({
      uri: 'https://countries.trevorblades.com/'
    }),
    cache: new InMemoryCache(),
  })
}