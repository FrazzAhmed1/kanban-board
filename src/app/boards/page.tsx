'use client'

import { gql, useQuery } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/nextjs'

const BOARDS = gql`
  query Boards {
    boards(order_by: { created_at: desc }) {
      id
      name
    }
  }
`

export default function BoardsPage() {
  const { isAuthenticated, isLoading: authLoading } =
    useAuthenticationStatus()

  const { data, loading, error } = useQuery(BOARDS, {
    skip: !isAuthenticated,
  })

  if (authLoading) return <p>Checking authentication…</p>
  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading) return <p>Loading boards…</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <ul>
      {data.boards.map((b: { id: string; name: string }) => (
        <li key={b.id}>{b.name}</li>
      ))}
    </ul>
  )
}
