-- Papers table (metadata + cache)
create table public.papers (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    filename text not null,
    file_hash text unique not null,  -- SHA256 for deduplication
    title text,
    authors text[],
    abstract text,
    page_count integer,
    
    -- Caching
    ocr_result jsonb,
    ocr_cached_at timestamptz,
    vision_result jsonb,
    vision_cached_at timestamptz,
    
    -- Status
    status text check (status in ('uploaded', 'processing_ocr', 'processing_vision', 'analyzing', 'complete', 'error')) default 'uploaded',
    error_message text,
    
    -- Economics
    total_cost_usd numeric(10,4) default 0,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Analyses table (final results)
create table public.analyses (
    id uuid default gen_random_uuid() primary key,
    paper_id uuid references public.papers on delete cascade not null,
    
    -- Structured results
    methodology_critique jsonb not null,
    dataset_audit jsonb not null,
    experiment_proposals jsonb not null,
    synthesis jsonb not null,
    grant_outline jsonb not null,
    
    -- Quality metrics
    overall_confidence numeric(3,2) check (overall_confidence >= 0 and overall_confidence <= 1),
    processing_time_ms integer,
    
    -- Raw storage for debugging
    raw_agent_outputs jsonb,
    
    created_at timestamptz default now()
);

-- Usage logs (audit trail)
create table public.usage_logs (
    id uuid default gen_random_uuid() primary key,
    paper_id uuid references public.papers,
    endpoint text not null,
    model text not null,
    input_tokens integer not null,
    output_tokens integer not null,
    estimated_cost numeric(10,6) not null,
    actual_cost numeric(10,6) not null,
    timestamp timestamptz default now()
);

-- Enable RLS (must be done AFTER creating tables)
alter table public.papers enable row level security;
alter table public.analyses enable row level security;
alter table public.usage_logs enable row level security;


-- RLS Policies
create policy "Users own their papers"
    on public.papers for all
    using (auth.uid() = user_id);

create policy "Users own their analyses"
    on public.analyses for all
    using (exists (
        select 1 from public.papers where id = analyses.paper_id and user_id = auth.uid()
    ));

-- Indexes
create index idx_papers_user on public.papers(user_id);
create index idx_papers_hash on public.papers(file_hash);
create index idx_analyses_paper on public.analyses(paper_id);
create index idx_usage_timestamp on public.usage_logs(timestamp);
