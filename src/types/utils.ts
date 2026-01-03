
export type Result<T, E = Error> = 
  | { ok: true; data: T }
  | { ok: false; error: E };

export function result<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  return promise
    .then((data): Result<T, E> => ({ ok: true, data }))
    .catch((error): Result<T, E> => ({ ok: false, error }));
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  columnId: string;
}

export interface Column {
  id: string;
  name: string;
  position: number;
  boardId: string;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
}
