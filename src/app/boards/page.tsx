'use client'

import { gql, useQuery } from '@apollo/client'
import { useAuthenticationStatus } from '@nhost/nextjs'

const BOARDS = gql`
  query Boards {
    kanbanboard_boards(order_by: { position: asc }) {
      id
      name
    }
  }
`



export default function BoardsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus()
  const { data, loading, error } = useQuery(BOARDS, {
    skip: !isAuthenticated,
  })

  if (authLoading) return <p>Checking auth…</p>
  if (!isAuthenticated) return <p>Please sign in</p>
  if (loading) return <p>Loading…</p>
  if (error) return <p>{error.message}</p>

  return (
    <ul>
      {data.kanbanboard_boards.map(
        (b: { id: string; name: string }) => (
          <li key={b.id}>{b.name}</li>
        )
      )}
    </ul>
  )
}
