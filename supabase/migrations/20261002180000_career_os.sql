-- Career OS / personalized roadmap security and student workflow.
-- Reuses existing career_profiles, career_skill_gaps, career_roadmaps and roadmap_items tables.

alter table public.career_roadmaps enable row level security;
alter table public.roadmap_items enable row level security;

drop policy if exists "roadmaps_owner" on public.career_roadmaps;
drop policy if exists "roadmap_items_owner" on public.roadmap_items;
drop policy if exists "Admins manage career roadmaps" on public.career_roadmaps;
drop policy if exists "Admins manage roadmap items" on public.roadmap_items;

create policy "Students read own career roadmaps"
  on public.career_roadmaps for select to authenticated
  using (student_id = auth.uid());

create policy "Admins manage career roadmaps"
  on public.career_roadmaps for all to authenticated
  using (public.has_role(auth.uid(),'admin'::public.app_role))
  with check (public.has_role(auth.uid(),'admin'::public.app_role));

create policy "Students read own roadmap items"
  on public.roadmap_items for select to authenticated
  using (exists (
    select 1 from public.career_roadmaps r
    where r.id = roadmap_items.roadmap_id and r.student_id = auth.uid()
  ));

create policy "Admins manage roadmap items"
  on public.roadmap_items for all to authenticated
  using (public.has_role(auth.uid(),'admin'::public.app_role))
  with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.get_my_career_os()
returns jsonb
language sql
security definer
set search_path = public
as $$
  with current_roadmap as (
    select *
    from public.career_roadmaps
    where student_id = auth.uid()
    order by updated_at desc
    limit 1
  )
  select jsonb_build_object(
    'profile', (select to_jsonb(cp) from public.career_profiles cp where cp.student_id = auth.uid()),
    'skill_gaps', coalesce(
      (select jsonb_agg(to_jsonb(sg) order by sg.domain) from public.career_skill_gaps sg where sg.student_id = auth.uid()),
      '[]'::jsonb
    ),
    'roadmap', (select to_jsonb(cr) from current_roadmap cr),
    'items', coalesce(
      (select jsonb_agg(to_jsonb(ri) order by ri.sort_order, ri.created_at)
       from public.roadmap_items ri
       where ri.roadmap_id = (select id from current_roadmap)),
      '[]'::jsonb
    )
  );
$$;

create or replace function public.update_my_roadmap_item_status(
  p_item_id uuid,
  p_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_status not in ('not_started','in_progress','completed','blocked') then
    raise exception 'Invalid roadmap status';
  end if;

  if not exists (
    select 1
    from public.roadmap_items ri
    join public.career_roadmaps cr on cr.id = ri.roadmap_id
    where ri.id = p_item_id
      and cr.student_id = auth.uid()
  ) then
    raise exception 'Roadmap item not found';
  end if;

  update public.roadmap_items
  set status = p_status,
      completed_at = case when p_status = 'completed' then now() else null end,
      updated_at = now()
  where id = p_item_id;

  return true;
end;
$$;

revoke execute on function public.get_my_career_os() from public;
revoke execute on function public.update_my_roadmap_item_status(uuid,text) from public;
grant execute on function public.get_my_career_os() to authenticated;
grant execute on function public.update_my_roadmap_item_status(uuid,text) to authenticated;
