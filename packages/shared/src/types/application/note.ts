export interface Note {
  id: number;
  application_id: number;
  date: Date; // defaults to CURRENT_DATE in DB
  text: string;
  created_at: Date; // set by DB
  updated_at: Date | null;
}

export interface NewNote {
  application_id: number; // must belong to the user
  text: string;
  date?: Date; // optional; DB has default to CURRENT_DATE
}

export interface UpdateNote {
  id: number; // note id
  text?: string;
  date?: Date;
}
