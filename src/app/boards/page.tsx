"use client";

import { gql, useQuery, useMutation, useSubscription } from "@apollo/client";
import { useAuthenticationStatus, useSignOut } from "@nhost/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const BOARDS_WITH_COLUMNS = gql`
  query BoardsWithColumns {
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

const BOARDS_SUBSCRIPTION = gql`
  subscription BoardsSubscription {
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
      name
    }
  }
`;

const UPDATE_BOARD = gql`
  mutation UpdateBoard($id: uuid!, $name: String!) {
    update_kanbanboard_boards_by_pk(pk_columns: { id: $id }, _set: { name: $name }) {
      id
      name
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
    update_kanbanboard_columns_by_pk(pk_columns: { id: $id }, _set: { position: $position, board_id: $boardId }) {
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

  const { data, loading, error, refetch, subscribeToMore } = useQuery(BOARDS_WITH_COLUMNS, {
    skip: !isAuthenticated
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = subscribeToMore({
      document: BOARDS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        
        const newData = subscriptionData.data;
        return {
          kanbanboard_boards: newData.kanbanboard_boards,
          kanbanboard_columns: newData.kanbanboard_columns,
        };
      },
      onError: (err) => {
        console.error("Subscription error:", err);
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, subscribeToMore]);

  const [createBoard] = useMutation(CREATE_BOARD, {
    onCompleted: () => {
      refetch();
    }
  });

  const [updateBoard] = useMutation(UPDATE_BOARD, {
    onCompleted: () => {
      refetch();
    }
  });

  const [updateBoardPosition] = useMutation(UPDATE_BOARD_POSITION, {
    onCompleted: () => {
      refetch();
    }
  });

  const [deleteBoard] = useMutation(DELETE_BOARD, {
    onCompleted: () => {
      refetch();
    }
  });

  const [insertColumn] = useMutation(INSERT_COLUMN, {
    onCompleted: () => {
      refetch();
    }
  });

  const [updateColumnPosition] = useMutation(UPDATE_COLUMN_POSITION, {
    onCompleted: () => {
      refetch();
    }
  });

  const [deleteColumn] = useMutation(DELETE_COLUMN, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === "BOARD") {
      const boards = Array.from(data.kanbanboard_boards);
      const [moved] = boards.splice(source.index, 1);
      boards.splice(destination.index, 0, moved);
      await Promise.all(boards.map((board: any, index) => 
        updateBoardPosition({ variables: { id: board.id, position: index } })
      ));
     
    } else if (type === "COLUMN") {
      const sourceBoardId = source.droppableId;
      const destBoardId = destination.droppableId;
      const allColumns = data.kanbanboard_columns;
      const sourceColumns = allColumns.filter((c: any) => c.board_id === sourceBoardId);
      const destColumns = allColumns.filter((c: any) => c.board_id === destBoardId);

      if (sourceBoardId === destBoardId) {
        const cols = Array.from(sourceColumns);
        const [moved] = cols.splice(source.index, 1);
        cols.splice(destination.index, 0, moved);
        await Promise.all(cols.map((col: any, index) => 
          updateColumnPosition({ variables: { id: col.id, position: index, boardId: sourceBoardId } })
        ));
      } else {
        const sourceCols = Array.from(sourceColumns);
        const destCols = Array.from(destColumns);
        const [moved] = sourceCols.splice(source.index, 1);
        destCols.splice(destination.index, 0, moved);
        await Promise.all([
          ...sourceCols.map((col: any, index) => 
            updateColumnPosition({ variables: { id: col.id, position: index, boardId: sourceBoardId } })
          ),
          ...destCols.map((col: any, index) => 
            updateColumnPosition({ variables: { id: col.id, position: index, boardId: destBoardId } })
          )
        ]);
      }
      
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    await createBoard({ variables: { name: newBoardName, position: boards?.length || 0 } });
    setNewBoardName("");
  };

  const handleUpdateBoard = async () => {
    if (!editId || !editName.trim()) return;
    await updateBoard({ variables: { id: editId, name: editName } });
    setEditId(null);
  };

  if (isLoading || loading) return <p className="p-6">Loading…</p>;
  if (!isAuthenticated) {
    router.push('/login');
    return <p className="p-6">Redirecting to login...</p>;
  }
  if (error) return <p className="p-6 text-red-600">Error loading boards: {error.message}</p>;
  if (!data || !data.kanbanboard_boards) return <p className="p-6">No boards found</p>;

  const boards = data.kanbanboard_boards;
  const allColumns = data.kanbanboard_columns || [];
  const columnsByBoard: Record<string, any[]> = {};
  allColumns.forEach((col: any) => {
    if (!columnsByBoard[col.board_id]) columnsByBoard[col.board_id] = [];
    columnsByBoard[col.board_id].push(col);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-white">Kanban Boards</h1>
        <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
          Logout
        </button>
      </div>

      <div className="flex gap-3 mb-8">
        <input
          className="border rounded-lg px-4 py-2 w-64"
          placeholder="New board name"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateBoard();
            }
          }}
        />
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleCreateBoard}
        >
          + Create Board
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="boards" type="BOARD" direction="horizontal">
          {(provided) => (
            <div className="flex gap-6 overflow-x-auto pb-4" {...provided.droppableProps} ref={provided.innerRef}>
              {boards.map((board: any, boardIndex: number) => (
                <Draggable key={board.id} draggableId={board.id} index={boardIndex}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="min-w-[320px] max-w-[320px] bg-gray-800 rounded-xl shadow-2xl p-5 flex flex-col">
                      <div {...provided.dragHandleProps} className="flex justify-between items-center mb-4 cursor-grab active:cursor-grabbing">
                        {editId === board.id ? (
                          <div className="flex gap-2 flex-1">
                            <input
                              className="border rounded px-2 py-1 flex-1 text-sm"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdateBoard();
                                }
                              }}
                            />
                            <button className="text-green-400 text-xs" onClick={handleUpdateBoard}>✓</button>
                          </div>
                        ) : (
                          <>
                            <h2 className="text-xl font-bold text-white">{board.name}</h2>
                            <div className="flex gap-2">
                              <button className="text-blue-400 text-xs" onClick={() => { setEditId(board.id); setEditName(board.name); }}>✏️</button>
                              <button className="text-red-400 text-xs" onClick={() => { deleteBoard({ variables: { id: board.id } }); }}>🗑️</button>
                            </div>
                          </>
                        )}
                      </div>

                      <Droppable droppableId={board.id} type="COLUMN">
                        {(provided) => (
                          <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px]" {...provided.droppableProps} ref={provided.innerRef}>
                            {columnsByBoard[board.id]?.map((column: any, colIndex: number) => (
                              <Draggable key={column.id} draggableId={column.id} index={colIndex}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-4 shadow-lg cursor-grab active:cursor-grabbing hover:shadow-xl transition"
                                    onClick={() => router.push(`/boards/${board.id}/columns/${column.id}`)}
                                  >
                                    <div className="flex justify-between items-center">
                                      <h3 className="font-bold text-white">{column.name}</h3>
                                      <button className="text-white text-xs opacity-70 hover:opacity-100" onClick={(e) => { e.stopPropagation(); deleteColumn({ variables: { id: column.id } }); }}>✕</button>
                                    </div>
                                    <p className="text-xs text-white/80 mt-1">Click for cards →</p>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                      <div className="mt-3">
                        <input
                          className="border border-dashed border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-2 w-full text-sm placeholder-gray-400"
                          placeholder="+ Add column"
                          value={newColumnNames[board.id] || ""}
                          onChange={(e) => setNewColumnNames({ ...newColumnNames, [board.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newColumnNames[board.id]?.trim()) {
                              const currentCols = columnsByBoard[board.id] || [];
                              insertColumn({ variables: { name: newColumnNames[board.id], boardId: board.id, position: currentCols.length } });
                              setNewColumnNames({ ...newColumnNames, [board.id]: "" });
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {boards.length === 0 && <p className="text-gray-400 text-center mt-12">No boards yet. Create one above!</p>}
    </div>
  );
}