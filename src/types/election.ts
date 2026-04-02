export type Candidate = {
  id: string;
  name: string;
  votes: number;
};

export type Category = {
  id: string; // 'president', 'secretary', 'treasurer'
  title: string;
  candidates: Record<string, Candidate>;
};

export type ElectionData = {
  [categoryId: string]: Category;
};
