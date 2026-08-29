-- MyShop V0.6.0 — Order Admin
-- Atomic admin workflow: controlled status transitions, internal note updates,
-- status timeline and audit logs. Direct table writes are restricted so the
-- management UI cannot bypass history/audit by updating orders directly.

create index if not exists idx_admin_audit_entity_created
  on public.admin_audit_logs(entity_type, entity_id, created_at desc);

create index if not exists idx_orders_created_at
  on public.orders(created_at desc);

-- Tighten operational order writes. Reads remain available to Admin and
-- customers through the existing V0.2.0 SELECT policies. V0.5.0 checkout and
-- V0.6.0 management mutations use SECURITY DEFINER RPCs.
drop policy if exists "admin_all_orders" on public.orders;
drop policy if exists "admin_order_select" on public.orders;
create policy "admin_order_select"
on public.orders for select to authenticated
using (public.is_admin());

drop policy if exists "admin_all_order_items" on public.order_items;
drop policy if exists "admin_order_items_select" on public.order_items;
create policy "admin_order_items_select"
on public.order_items for select to authenticated
using (public.is_admin());

drop policy if exists "admin_all_order_status_history" on public.order_status_history;
drop policy if exists "admin_order_history_select" on public.order_status_history;
create policy "admin_order_history_select"
on public.order_status_history for select to authenticated
using (public.is_admin());

create or replace function public.admin_transition_order(
  p_order_id uuid,
  p_to_status text,
  p_note text default null
)
returns table (
  order_id uuid,
  from_status public.order_status,
  to_status public.order_status,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_to public.order_status;
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_allowed boolean := false;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_order_id is null then
    raise exception 'ORDER_ID_REQUIRED';
  end if;

  if p_to_status is null or p_to_status not in (
    'NEW', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'ARCHIVED'
  ) then
    raise exception 'INVALID_ORDER_STATUS';
  end if;

  v_to := p_to_status::public.order_status;

  if v_note is not null and length(v_note) > 500 then
    raise exception 'STATUS_NOTE_TOO_LONG';
  end if;

  select * into v_order
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if v_order.status = v_to then
    raise exception 'STATUS_NOT_CHANGED';
  end if;

  -- V0.6.0 controlled workflow.
  v_allowed := case v_order.status
    when 'NEW' then v_to in ('CONFIRMED', 'CANCELLED')
    when 'CONFIRMED' then v_to in ('PROCESSING', 'CANCELLED')
    when 'PROCESSING' then v_to in ('SHIPPING', 'CANCELLED')
    when 'SHIPPING' then v_to in ('COMPLETED', 'CANCELLED')
    when 'COMPLETED' then v_to = 'ARCHIVED'
    when 'CANCELLED' then v_to = 'ARCHIVED'
    when 'ARCHIVED' then false
    else false
  end;

  if not v_allowed then
    raise exception 'INVALID_STATUS_TRANSITION';
  end if;

  if v_to = 'CANCELLED' and (v_note is null or length(v_note) < 3) then
    raise exception 'CANCEL_REASON_REQUIRED';
  end if;

  update public.orders
  set status = v_to,
      updated_at = now()
  where id = v_order.id;

  insert into public.order_status_history (
    order_id,
    from_status,
    to_status,
    note,
    changed_by
  ) values (
    v_order.id,
    v_order.status,
    v_to,
    v_note,
    auth.uid()
  );

  insert into public.admin_audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    payload
  ) values (
    auth.uid(),
    'order_status_changed',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'order_code', v_order.order_code,
      'from_status', v_order.status::text,
      'to_status', v_to::text,
      'note', v_note
    )
  );

  return query
  select v_order.id, v_order.status, v_to, now();
end;
$$;

revoke all on function public.admin_transition_order(uuid,text,text) from public;
grant execute on function public.admin_transition_order(uuid,text,text) to authenticated;

create or replace function public.admin_update_order_internal_note(
  p_order_id uuid,
  p_internal_note text
)
returns table (
  order_id uuid,
  internal_note text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_note text := nullif(trim(coalesce(p_internal_note, '')), '');
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if p_order_id is null then
    raise exception 'ORDER_ID_REQUIRED';
  end if;

  if v_note is not null and length(v_note) > 2000 then
    raise exception 'INTERNAL_NOTE_TOO_LONG';
  end if;

  select * into v_order
  from public.orders o
  where o.id = p_order_id
  for update;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  update public.orders
  set internal_note = v_note,
      updated_at = now()
  where id = v_order.id;

  insert into public.admin_audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    payload
  ) values (
    auth.uid(),
    'order_internal_note_updated',
    'order',
    v_order.id::text,
    jsonb_build_object(
      'order_code', v_order.order_code,
      'had_previous_note', v_order.internal_note is not null,
      'has_new_note', v_note is not null
    )
  );

  return query
  select v_order.id, v_note, now();
end;
$$;

revoke all on function public.admin_update_order_internal_note(uuid,text) from public;
grant execute on function public.admin_update_order_internal_note(uuid,text) to authenticated;

comment on function public.admin_transition_order(uuid,text,text)
  is 'V0.6.0 Admin-only controlled order status workflow with history + audit.';
comment on function public.admin_update_order_internal_note(uuid,text)
  is 'V0.6.0 Admin-only internal note update with audit.';
