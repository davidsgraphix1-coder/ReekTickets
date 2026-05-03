-- Supabase schema for ReekTickets gate entry and event ticketing

-- Users table (if not already defined)
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  full_name text,
  email text unique,
  phone text,
  role text,
  profile_picture text,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events table
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  location text,
  date timestamptz,
  start_time timestamptz,
  end_time timestamptz,
  organizer_id uuid references users(id),
  organizer_profile_pic text,
  visibility text default 'public',
  published boolean default true,
  ticket_types jsonb,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tickets table
create table if not exists tickets (
  id uuid primary key default uuid_generate_v4(),
  reference text unique,
  event_id uuid references events(id),
  user_id uuid references users(id),
  ticket_type text,
  price numeric,
  quantity int,
  status text default 'active',
  sms_code text,
  access_code text,
  sms_code_expiry timestamptz,
  entry_timestamp timestamptz,
  wristband_status text default 'pending',
  wristband_number text,
  wristband_issued_at timestamptz,
  gate_entry_staff_id uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Gate entry logs table
create table if not exists gate_entry_logs (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references tickets(id),
  event_id uuid references events(id),
  attendee_id uuid references users(id),
  gate_staff_id uuid references users(id),
  entry_timestamp timestamptz default now(),
  wristband_issued boolean default false,
  wristband_number text,
  wristband_issued_at timestamptz,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Indexes for faster gate lookup
create index if not exists idx_tickets_event_id on tickets(event_id);
create index if not exists idx_tickets_user_id on tickets(user_id);
create index if not exists idx_gate_entry_logs_event_id on gate_entry_logs(event_id);
create index if not exists idx_gate_entry_logs_ticket_id on gate_entry_logs(ticket_id);
