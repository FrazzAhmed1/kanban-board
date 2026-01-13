'use client'

import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
    }
  }
`

type CountriesData = {
  countries: {
    code: string
    name: string
  }[]
}

export default function CountriesPage() {
  const { data, loading, error } =
    useQuery<CountriesData>(GET_COUNTRIES)

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <main style={{ padding: 20 }}>
      <h1>Countries</h1>
      <ul>
        {data?.countries.map((c) => (
          <li key={c.code}>{c.name}</li>
        ))}
      </ul>
    </main>
  )
}
