-- Property Match AI — Supabase Schema
-- Run this in your Supabase SQL editor to create all required tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- CLIENTS
create table if not exists clients (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  name text not null,
  email text,
  phone text,
  budget_min integer,
  budget_max integer,
  preferred_locations text[],
  property_type text,
  bedrooms_min integer,
  bathrooms_min integer,
  car_spaces integer,
  land_size_min integer,
  investment_type text,
  must_haves text[],
  nice_to_haves text[],
  excluded_features text[],
  notes text,
  status text default 'Active'
);

-- PROPERTIES
create table if not exists properties (
  id uuid primary key default uuid_generate_v4(),
  domain_listing_id text unique,
  address text,
  suburb text,
  state text,
  postcode text,
  price integer,
  bedrooms integer,
  bathrooms integer,
  car_spaces integer,
  land_size integer,
  property_type text,
  description text,
  images text[],
  listing_url text,
  days_on_market integer,
  fetched_at timestamptz
);

-- PROPERTY MATCHES
create table if not exists property_matches (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references clients(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  match_score integer check (match_score between 0 and 100),
  score_breakdown jsonb,
  strengths text[],
  considerations text[],
  red_flags text[],
  ai_commentary text,
  status text default 'New',
  created_at timestamptz default now(),
  unique(client_id, property_id)
);

-- INSPECTION REPORTS
create table if not exists inspection_reports (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid references property_matches(id) on delete cascade,
  exterior_score integer check (exterior_score between 1 and 10),
  interior_score integer check (interior_score between 1 and 10),
  kitchen_score integer check (kitchen_score between 1 and 10),
  bathroom_score integer check (bathroom_score between 1 and 10),
  flooring_score integer check (flooring_score between 1 and 10),
  roof_score integer check (roof_score between 1 and 10),
  structural_score integer check (structural_score between 1 and 10),
  neighbourhood_score integer check (neighbourhood_score between 1 and 10),
  noise_score integer check (noise_score between 1 and 10),
  renovation_required boolean default false,
  estimated_reno_cost integer,
  notes text,
  photos text[],
  submitted_at timestamptz
);

-- RLS: Enable row-level security (configure policies as needed for your auth setup)
alter table clients enable row level security;
alter table properties enable row level security;
alter table property_matches enable row level security;
alter table inspection_reports enable row level security;

-- For development (single-user / agent use): allow all authenticated users full access
-- Replace with stricter policies when adding multi-user auth
create policy "Allow all" on clients for all using (true) with check (true);
create policy "Allow all" on properties for all using (true) with check (true);
create policy "Allow all" on property_matches for all using (true) with check (true);
create policy "Allow all" on inspection_reports for all using (true) with check (true);
