"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useState } from "react";

const GET_CARDS = gql`
  query GetCards($columnId: uuid!) {
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
    insert_kanbanboard_cards(
      objects: [{ title: $title, column_id: $columnId }]
    ) {
      affected_rows
    }
  }
`;

const DELETE_CARD = gql`
  mutation DeleteCard($id: uuid!) {
    delete_kanbanboard_cards(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export default function CardsPage() {
  const { columnId } = useParams<{ columnId: string }>();
  const [title, setTitle] = useState("");

  const { data, loading } = useQuery(GET_CARDS, {
    variables: { columnId },
    skip: !columnId,
  });

  const [insertCard] = useMutation(INSERT_CARD, {
    refetchQueries: [{ query: GET_CARDS, variables: { columnId } }],
  });

  const [deleteCard] = useMutation(DELETE_CARD, {
    refetchQueries: [{ query: GET_CARDS, variables: { columnId } }],
  });

  if (loading || !data) return <p className="p-6">Loading…</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-xl mx-auto">
      <div className="flex gap-3 mb-6">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="New card"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 rounded-lg"
          onClick={() => {
            if (!title.trim()) return;
            insertCard({ variables: { title, columnId } });
            setTitle("");
          }}
        >
          Add
        </button>
      </div>

      <div className="space-y-3">
        {data.kanbanboard_cards.map((card: any) => (
          <div
            key={card.id}
            className="bg-white rounded-xl shadow p-4 flex justify-between"
          >
            <span>{card.title}</span>
            <button
              className="text-red-600 text-sm"
              onClick={() => deleteCard({ variables: { id: card.id } })}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
