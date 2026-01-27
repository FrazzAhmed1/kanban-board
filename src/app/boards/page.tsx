"use client";

import { gql, useMutation, useSubscription } from "@apollo/client";
import { useAuthenticationStatus, useSignOut } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const BOARDS_WITH_COLUMNS = gql`
  subscription BoardsWithColumns {
    kanbanboard_boards(order_by: { position: asc }) {
      id
      name
      position
    }
    kanbanboard_columns(order_by: { board_id: asc, position: asc }) {
      id
      name
      board_id
      position
    }
  }
`;

const CREATE_BOARD = gql`
  mutation CreateBoard($name: String!, $position: numeric) {
    insert_kanbanboard_boards_one(object: { name: $name, position: $position }) {
      id
    }
  }
`;

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: uuid!, $name: String!) {
    update_kanbanboard_boards_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
      id
    }
  }
`;

const UPDATE_BOARD_POSITION = gql`
  mutation UpdateBoardPosition($id: uuid!, $position: numeric!) {
    update_kanbanboard_boards_by_pk(pk_columns: { id: $id }, _set: { position: $position }) {
      id
    }
  }
`;

const DELETE_BOARD = gql`
  mutation DeleteBoard($id: uuid!) {
    delete_kanbanboard_boards_by_pk(id: $id) {
      id
    }
  }
`;

const INSERT_COLUMN = gql`
  mutation InsertColumn($name: String!, $boardId: uuid!, $position: numeric) {
    insert_kanbanboard_columns_one(object: { name: $name, board_id: $boardId, position: $position }) {
      id
    }
  }
`;

const UPDATE_COLUMN_POSITION = gql`
  mutation UpdateColumnPosition($id: uuid!, $position: numeric!, $boardId: uuid!) {
    update_kanbanboard_columns_by_pk(
      pk_columns: { id: $id }
      _set: { position: $position, board_id: $boardId }
    ) {
      id
    }
  }
`;

const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: uuid!) {
    delete_kanbanboard_columns_by_pk(id: $id) {
      id
    }
  }
`;

export default function BoardsClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const { signOut } = useSignOut();

  const [newBoardName, setNewBoardName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newColumnNames, setNewColumnNames] = useState<Record<string, string>>({});

  const { data, loading, error } = useSubscription(BOARDS_WITH_COLUMNS, {
    skip: !isAuthenticated,
  });

  const [createBoard] = useMutation(CREATE_BOARD);
  const [updateBoard] = useMutation(UPDATE_BOARD);
  const [updateBoardPosition] = useMutation(UPDATE_BOARD_POSITION);
  const [deleteBoard] = useMutation(DELETE_BOARD);
  const [insertColumn] = useMutation(INSERT_COLUMN);
  const [updateColumnPosition] = useMutation(UPDATE_COLUMN_POSITION);
  const [deleteColumn] = useMutation(DELETE_COLUMN);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === "BOARD") {
      const boards = Array.from(data.kanbanboard_boards);
      const [moved] = boards.splice(source.index, 1);
      boards.splice(destination.index, 0, moved);
      await Promise.all(
        boards.map((b: any, i: number) =>
          updateBoardPosition({ variables: { id: b.id, position: i } })
        )
      );
    } else {
      const sourceBoardId = source.droppableId;
      const destBoardId = destination.droppableId;
      const all = data.kanbanboard_columns;
      const sourceCols = all.filter((c: any) => c.board_id === sourceBoardId);
      const destCols = all.filter((c: any) => c.board_id === destBoardId);

      if (sourceBoardId === destBoardId) {
        const cols = Array.from(sourceCols);
        const [moved] = cols.splice(source.index, 1);
        cols.splice(destination.index, 0, moved);
        await Promise.all(
          cols.map((c: any, i: number) =>
            updateColumnPosition({
              variables: { id: c.id, position: i, boardId: sourceBoardId },
            })
          )
        );
      } else {
        const src = Array.from(sourceCols);
        const dst = Array.from(destCols);
        const [moved] = src.splice(source.index, 1);
        dst.splice(destination.index, 0, moved);
        await Promise.all([
          ...src.map((c: any, i: number) =>
            updateColumnPosition({
              variables: { id: c.id, position: i, boardId: sourceBoardId },
            })
          ),
          ...dst.map((c: any, i: number) =>
            updateColumnPosition({
              variables: { id: c.id, position: i, boardId: destBoardId },
            })
          ),
        ]);
      }
    }
  };

  if (isLoading || loading) return <p className="p-6">Loading…</p>;
  if (!isAuthenticated) {
    router.push("/login");
    return <p className="p-6">Redirecting…</p>;
  }
  if (error) return <p className="p-6 text-red-600">{error.message}</p>;

  const boards = data.kanbanboard_boards;
  const columnsByBoard: Record<string, any[]> = {};
  data.kanbanboard_columns.forEach((c: any) => {
    if (!columnsByBoard[c.board_id]) columnsByBoard[c.board_id] = [];
    columnsByBoard[c.board_id].push(c);
  });

  return (
    <div className="min-h-screen p-10">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl text-white">Kanban Boards</h1>
        <button onClick={signOut}>Logout</button>
      </div>

      <div className="flex gap-2 mb-6">
        <input value={newBoardName} onChange={(e) => setNewBoardName(e.target.value)} />
        <button
          onClick={() => {
            if (!newBoardName.trim()) return;
            createBoard({ variables: { name: newBoardName, position: boards.length } });
            setNewBoardName("");
          }}
        >
          Create
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="boards" type="BOARD" direction="horizontal">
          {(p) => (
            <div ref={p.innerRef} {...p.droppableProps} className="flex gap-4">
              {boards.map((board: any, i: number) => (
                <Draggable key={board.id} draggableId={board.id} index={i}>
                  {(p) => (
                    <div ref={p.innerRef} {...p.draggableProps} className="w-72 p-4 bg-gray-800">
                      <div {...p.dragHandleProps} className="flex justify-between">
                        {editId === board.id ? (
                          <>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            <button
                              onClick={() => {
                                updateBoard({ variables: { id: board.id, name: editName } });
                                setEditId(null);
                              }}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{board.name}</span>
                            <button onClick={() => { setEditId(board.id); setEditName(board.name); }}>
                              Edit
                            </button>
                            <button onClick={() => deleteBoard({ variables: { id: board.id } })}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>

                      <Droppable droppableId={board.id} type="COLUMN">
                        {(p) => (
                          <div ref={p.innerRef} {...p.droppableProps}>
                            {columnsByBoard[board.id]?.map((col: any, j: number) => (
                              <Draggable key={col.id} draggableId={col.id} index={j}>
                                {(p) => (
                                  <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                    onClick={() =>
                                      router.push(`/boards/${board.id}/columns/${col.id}`)
                                    }
                                  >
                                    {col.name}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteColumn({ variables: { id: col.id } });
                                      }}
                                    >
                                      x
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {p.placeholder}
                          </div>
                        )}
                      </Droppable>

                      <input
                        value={newColumnNames[board.id] || ""}
                        onChange={(e) =>
                          setNewColumnNames({ ...newColumnNames, [board.id]: e.target.value })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            insertColumn({
                              variables: {
                                name: newColumnNames[board.id],
                                boardId: board.id,
                                position: columnsByBoard[board.id]?.length || 0,
                              },
                            });
                            setNewColumnNames({ ...newColumnNames, [board.id]: "" });
                          }
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {p.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
