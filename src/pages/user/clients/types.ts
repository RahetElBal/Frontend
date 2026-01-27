export type ClientModalState = {
  clientId: string | "create";
  mode: "view" | "edit" | "delete";
} | null;
