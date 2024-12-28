-- Drop existing materialized view
drop materialized view if exists public.dashboard_metrics;

-- Recreate with bounce rate
create materialized view public.dashboard_metrics as
with 
  page_visits as (
    select
      page_events.site_id,
      page_events.href as page,
      count(*) as visit_count
    from
      page_events
    group by
      page_events.site_id,
      page_events.href
  ),
  session_page_counts as (
    select
      s.id as session_id,
      s.site_id,
      count(distinct pe.href) as page_count
    from
      sessions s
      left join page_events pe on s.id = pe.session_id
    group by
      s.id,
      s.site_id
  ),
  session_metrics as (
    select
      s.site_id,
      count(distinct s.id) as total_sessions,
      avg(s.duration) as avg_duration,
      count(pe.href)::double precision / count(distinct s.id)::double precision as pages_per_session,
      count(case when spc.page_count = 1 then 1 end)::double precision / nullif(count(distinct s.id), 0)::double precision * 100 as bounce_rate
    from
      sessions s
      left join page_events pe on s.id = pe.session_id
      left join session_page_counts spc on s.id = spc.session_id
    group by
      s.site_id
  )
select
  sm.site_id,
  sm.total_sessions,
  sm.avg_duration,
  sm.pages_per_session,
  sm.bounce_rate,
  json_agg(
    json_build_object('page', pv.page, 'count', pv.visit_count)
  ) as top_pages
from
  session_metrics sm
  left join page_visits pv on sm.site_id = pv.site_id
group by
  sm.site_id,
  sm.total_sessions,
  sm.avg_duration,
  sm.pages_per_session,
  sm.bounce_rate;

-- Grant necessary permissions
grant select on public.dashboard_metrics to authenticated;
grant select on public.dashboard_metrics to service_role;