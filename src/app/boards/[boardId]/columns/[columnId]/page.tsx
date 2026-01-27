"use client";

import { gql, useMutation, useSubscription } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { type } from "os";

const CARDS_SUB = gql`
  subscription CardsByColumn($columnId: uuid!) {
    kanbanboard_cards(
      where: { column_id: { _eq: $columnId } }
      order_by: { position: asc }
    ) {
      id
      title
      column_id
    }
  }
`;

const INSERT_CARD = gql`
  mutation InsertCard($title: String!, $columnId: uuid!) {
    insert_kanbanboard_cards_one(
      object: { title: $title, column_id: $columnId }
    ) {
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
  const params = useParams();
  const router = useRouter();

  const boardId = params?.boardId as string;
  const columnId = params?.columnId as string;

  const [title, setTitle] = useState("");

  const { data, loading, error } = useSubscription(CARDS_SUB, {
    variables: { columnId },
    skip: !columnId,
  });

  const [insertCard] = useMutation(INSERT_CARD);
  const [deleteCard] = useMutation(DELETE_CARD);

  if (loading || !data) {
    return <p className="p-6 text-white">Loading…</p>;
  }

  if (error) {
    return <p className="p-6 text-red-500">{error.message}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
  onClick={() => router.push('/boards')}
  className="text-blue-400 hover:text-blue-300"
>
  ← Back to Boards
</button>
          <h1 className="text-3xl font-bold text-white">Cards</h1>
        </div>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6">
          <div className="flex gap-3">
            <input
              className="border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-2 flex-1 placeholder-gray-400"
              placeholder="New card title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  insertCard({ variables: { title, columnId } });
                  setTitle("");
                }
              }}
            />
            <button
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => {
                if (!title.trim()) return;
                insertCard({ variables: { title, columnId } });
                setTitle("");
              }}
            >
              + Add Card
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {data.kanbanboard_cards.map((card: any) => (
            <div
              key={card.id}
              className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-4 shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">{card.title}</span>
                <button
                  className="text-white text-sm opacity-70 hover:opacity-100"
                  onClick={() => {
                    if (confirm(`Delete "${card.title}"?`)) {
                      deleteCard({ variables: { id: card.id } });
                    }
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {data.kanbanboard_cards.length === 0 && (
          <p className="text-gray-400 text-center mt-12">
            No cards yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
}
