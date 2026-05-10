create table votes (
  id uuid default gen_random_uuid() primary key,
  contestant text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);