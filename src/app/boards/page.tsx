"use client";

import { gql, useQuery, useMutation } from "@apollo/client";
import { useAuthenticationStatus, useSignOut } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BOARDS = gql`
  query Boards {
    kanbanboard_boards(order_by: { position: asc }) {
      id
      name
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!) {
    insert_kanbanboard_boards_one(object: { name: $name }) {
      id
      name
    }
  }
`;

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: uuid!, $name: String!) {
    update_kanbanboard_boards_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name }
    ) {
      id
      name
    }
  }
`;

const DELETE_BOARD = gql`
  mutation DeleteBoard($id: uuid!) {
    delete_kanbanboard_boards(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export default function BoardsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { signOut } = useSignOut();

  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data, loading } = useQuery(BOARDS, { skip: !isAuthenticated });

  const [createBoard] = useMutation(CREATE_BOARD, {
    refetchQueries: [{ query: BOARDS }],
  });

  const [updateBoard] = useMutation(UPDATE_BOARD, {
    refetchQueries: [{ query: BOARDS }],
  });

  const [deleteBoard] = useMutation(DELETE_BOARD, {
    refetchQueries: [{ query: BOARDS }],
  });

  if (isLoading || loading) return <p className="p-6">Loading…</p>;
  if (!isAuthenticated) return <p className="p-6">Please sign in</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Boards</h1>
        <button onClick={signOut} className="text-sm text-red-600">
          Logout
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          className="border rounded-lg px-4 py-2 w-64"
          placeholder="New board name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          className="bg-black text-white px-5 py-2 rounded-lg"
          onClick={() => {
            if (!newName.trim()) return;
            createBoard({ variables: { name: newName } });
            setNewName("");
          }}
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.kanbanboard_boards.map((b: any) => (
          <div
            key={b.id}
            className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition cursor-pointer"
          >
            {editId === b.id ? (
              <div className="flex gap-2">
                <input
                  className="border rounded px-2 py-1 flex-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <button
                  className="text-green-600 text-sm"
                  onClick={() => {
                    updateBoard({ variables: { id: b.id, name: editName } });
                    setEditId(null);
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <h2
                  className="text-lg font-semibold mb-4"
                  onClick={() => router.push(`/boards/${b.id}`)}
                >
                  {b.name}
                </h2>
                <div className="flex gap-4 text-sm">
                  <button
                    className="text-blue-600"
                    onClick={() => {
                      setEditId(b.id);
                      setEditName(b.name);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => deleteBoard({ variables: { id: b.id } })}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
