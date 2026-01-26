export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export abstract class TodoRepository {
  abstract all(completed?: boolean): Todo[];
  abstract get(id: number): Todo | undefined;
  abstract create(title: string): Todo;
  abstract update(id: number, patch: Partial<Todo>): Todo | undefined;
  abstract delete(id: number): boolean;
}
