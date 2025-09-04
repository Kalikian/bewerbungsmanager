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
  salary?: number;                     // Optional: Salary information
  work_model?: string;                 // Optional: Work model (e.g. remote, onsite)
  start_date?: string;                 // Optional: Start date string 
  applied_date?: string;               // Optional: applied date can be string
  application_deadline?: string;       // Optional: Application deadline can be string 
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
  salary?: number;
  work_model?: string | null;
  start_date?: string | null;
  application_deadline?: string | null;
  applied_date?: string | null
  status: ApplicationStatus;
  created_at: string;
}

// prettier-ignore
// Type definition for updating an application (partial update)
export interface UpdateApplication {
  id: number;
  job_title?: string;
  company?: string;
  contact_name?: string | null;        
  contact_email?: string | null;       
  contact_phone?: string | null;       
  address?: string | null;             
  job_source?: string | null;          
  job_url?: string | null;             
  salary?: number | null;              
  work_model?: string | null;          
  start_date?: string | null;          
  application_deadline?: string | null; 
  applied_date?: string | null
  status?: ApplicationStatus;
}
