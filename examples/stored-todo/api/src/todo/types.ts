export type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export type TodoRepo = {
  all(completed?: boolean): Todo[];
  get(id: number): Todo | undefined;
  create(title: string): Todo;
  update(id: number, patch: Partial<Todo>): Todo | undefined;
  delete(id: number): boolean;
};
