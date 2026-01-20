export type Theme = {
  id: string;
  name: string;
  type: 'dark' | 'light'; // Helpful for UI logic later
  variables: Record<string, string>;
};