// Allowed status values for job applications
export type ApplicationStatus =
  | 'open'
  | 'applied'
  | 'interview'
  | 'rejected'
  | 'offer'
  | 'contract'
  | 'withdrawn';

// prettier-ignore
// Type definition for a new application (insert)
export interface NewApplication {
  user_id: number;                     // Required: Foreign key to user
  job_title?: string;                  // Optional: Job title for the application
  company?: string;                    // Optional: Company name
  contact_name?: string;               // Optional: Contact person
  contact_email?: string;              // Optional: Contact email
  contact_phone?: string;              // Optional: Contact phone number
  address?: string;                    // Optional: Address of the company or job
  job_source?: string;                 // Optional: Where the job was found (e.g. LinkedIn)
  job_url?: string;                    // Optional: Link to the job posting
  salary?: string;                     // Optional: Salary information
  work_model?: string;                 // Optional: Work model (e.g. remote, onsite)
  start_date?: Date;                   // Optional: Start date (can be string or Date)
  application_deadline?: Date;         // Optional: Application deadline (can be string or Date)
  status?: ApplicationStatus;          // Optional: Application status (restricted to allowed values)
  // created_at is set automatically by the database (DEFAULT now())
}

// Type definition for an application (select)
export interface Application {
  id: number;
  user_id: number;
  job_title?: string;
  company?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  job_source?: string;
  job_url?: string;
  salary?: string;
  work_model?: string;
  start_date?: Date;
  application_deadline?: Date;
  status?: ApplicationStatus;
  created_at: Date;
}

// prettier-ignore
// Type definition for updating an application (partial update)
export interface UpdateApplication {
  id: number;                        // Required: ID of the application to update
  job_title?: string;
  company?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  job_source?: string;
  job_url?: string;
  salary?: string;
  work_model?: string;
  start_date?: Date;
  application_deadline?: Date;
  status?: ApplicationStatus;
}
