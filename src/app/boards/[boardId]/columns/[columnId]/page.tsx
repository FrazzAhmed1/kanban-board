"use client";

import { gql, useMutation, useSubscription } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const GET_CARDS = gql`
  subscription GetCards($columnId: uuid!) {
    kanbanboard_cards(
      where: { column_id: { _eq: $columnId } }
      order_by: { position: asc }
    ) {
      id
      title
    }
  }
`;

const INSERT_CARD = gql`
  mutation InsertCard($title: String!, $columnId: uuid!) {
    insert_kanbanboard_cards_one(object: { title: $title, column_id: $columnId }) {
      id
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($id: uuid!) {
    delete_kanbanboard_cards_by_pk(id: $id) {
      id
    }
  }
`;

export default function CardsPage() {
  const { columnId, boardId } = useParams() as {
    columnId: string;
    boardId: string;
  };
  const router = useRouter();
  const [title, setTitle] = useState("");

  const { data, loading } = useSubscription(GET_CARDS, {
    variables: { columnId },
    skip: !columnId,
  });

  const [insertCard] = useMutation(INSERT_CARD);
  const [deleteCard] = useMutation(DELETE_CARD);

  if (loading || !data) return <p>Loading…</p>;

  return (
    <div className="p-10">
      <button onClick={() => router.push('/boards')}>&lt; Back to Boards</button>


      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button
        onClick={() => {
          if (!title.trim()) return;
          insertCard({ variables: { title, columnId } });
          setTitle("");
        }}
      >
        Add
      </button>

      {data.kanbanboard_cards.map((card: any) => (
        <div key={card.id}>
          {card.title}
          <button onClick={() => deleteCard({ variables: { id: card.id } })}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}
