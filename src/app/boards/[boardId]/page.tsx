"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const GET_COLUMNS = gql`
  query GetColumns($boardId: uuid!) {
    kanbanboard_columns(
      where: { board_id: { _eq: $boardId } }
      order_by: { position: asc }
    ) {
      id
      name
    }
  }
`;

const INSERT_COLUMN = gql`
  mutation InsertColumn($name: String!, $boardId: uuid!) {
    insert_kanbanboard_columns(
      objects: [{ name: $name, board_id: $boardId }]
    ) {
      affected_rows
    }
  }
`;

const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: uuid!) {
    delete_kanbanboard_columns(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export default function BoardColumnsPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const router = useRouter();
  const [name, setName] = useState("");

  const { data, loading } = useQuery(GET_COLUMNS, {
    variables: { boardId },
    skip: !boardId,
  });

  const [insertColumn] = useMutation(INSERT_COLUMN, {
    refetchQueries: [{ query: GET_COLUMNS, variables: { boardId } }],
  });

  const [deleteColumn] = useMutation(DELETE_COLUMN, {
    refetchQueries: [{ query: GET_COLUMNS, variables: { boardId } }],
  });

  if (loading || !data) return <p className="p-6">Loading…</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex gap-3 mb-6">
        <input
          className="border rounded-lg px-3 py-2"
          placeholder="New column"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="bg-black text-white px-4 rounded-lg"
          onClick={() => {
            if (!name.trim()) return;
            insertColumn({ variables: { name, boardId } });
            setName("");
          }}
        >
          Add
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {data.kanbanboard_columns.map((column: any) => (
          <div
            key={column.id}
            className="min-w-[260px] bg-white rounded-xl shadow p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{column.name}</h3>
              <button
                className="text-xs text-red-600"
                onClick={() =>
                  deleteColumn({ variables: { id: column.id } })
                }
              >
                ✕
              </button>
            </div>

            <button
              className="text-sm text-blue-600"
              onClick={() =>
                router.push(`/boards/${boardId}/columns/${column.id}`)
              }
            >
              View cards →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
