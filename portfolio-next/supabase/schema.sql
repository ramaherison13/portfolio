-- =====================================================================
-- SCHÉMA SUPABASE — Portfolio + espace Admin
-- À exécuter une fois dans : Supabase > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. ADMINS : seuls les emails listés ici accèdent à /admin
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key
);

-- Retourne true si l'utilisateur connecté est dans la table admins
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------------------------------------------------------------------
-- 2. EVENTS : actions des visiteurs (sans IP, sans donnée personnelle)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in
              ('visit','project_click','cv_download','interested','message','social_click')),
  page        text,
  target      text,                 -- nom du projet, du réseau, motif « intéressé »…
  country     text,                 -- pays approximatif (nom, pas d'IP)
  device      text check (device in ('mobile','tablet','desktop')),
  visitor_id  text,                 -- identifiant anonyme aléatoire (localStorage)
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists events_created_idx on public.events (created_at desc);
create index if not exists events_type_idx    on public.events (type, created_at desc);

-- ---------------------------------------------------------------------
-- 3. NOTIFICATIONS : alimentées automatiquement par un trigger
-- ---------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events(id) on delete set null,
  type        text not null,
  body        text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists notif_created_idx on public.notifications (created_at desc);
create index if not exists notif_unread_idx  on public.notifications (read) where read = false;

create or replace function public.notify_from_event()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  who text;
  txt text;
begin
  who := case when coalesce(new.country, '') = '' then 'Un visiteur'
              else 'Un visiteur de ' || new.country end;
  txt := case new.type
    when 'visit'         then who || ' vient d''arriver sur le site (' || coalesce(new.device, 'appareil inconnu') || ').'
    when 'project_click' then who || ' a consulté le projet « ' || coalesce(new.target, '?') || ' ».'
    when 'cv_download'   then who || ' a téléchargé votre CV.'
    when 'interested'    then who || ' semble intéressé par votre profil'
                              || case when new.target is not null then ' (' || new.target || ')' else '' end || '.'
    when 'message'       then 'Nouveau message de ' || coalesce(new.target, 'un visiteur') || '.'
    when 'social_click'  then who || ' a cliqué sur ' || coalesce(new.target, 'un réseau social') || '.'
    else 'Nouvelle activité.'
  end;
  insert into public.notifications (event_id, type, body) values (new.id, new.type, txt);
  return new;
end;
$$;

drop trigger if exists trg_notify_from_event on public.events;
create trigger trg_notify_from_event
  after insert on public.events
  for each row execute function public.notify_from_event();

-- ---------------------------------------------------------------------
-- 4. MESSAGES : formulaire de contact
-- ---------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name)  between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  body        text not null check (char_length(body)  between 1 and 5000),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists messages_created_idx on public.messages (created_at desc);

-- ---------------------------------------------------------------------
-- 5. CONTENU DU SITE : projets, compétences, textes
-- ---------------------------------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  category    text not null check (category in ('web','design','mobile')),
  description text not null default '',
  tech        text not null default '',
  link        text not null default '',
  icon        text not null default 'fa-globe',
  sort        int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.skills (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  level int  not null default 80 check (level between 0 and 100),
  sort  int  not null default 0
);

create table if not exists public.site_content (
  key   text primary key,
  value text not null default ''
);

-- ---------------------------------------------------------------------
-- 6. SÉCURITÉ (Row Level Security)
--    - Le visiteur anonyme peut seulement LIRE le contenu public.
--    - Les écritures de events/messages passent par l'API Next.js avec la
--      clé service_role (jamais exposée au navigateur).
--    - Seul un admin lit events / notifications / messages.
-- ---------------------------------------------------------------------
alter table public.admins        enable row level security;
alter table public.events        enable row level security;
alter table public.notifications enable row level security;
alter table public.messages      enable row level security;
alter table public.projects      enable row level security;
alter table public.skills        enable row level security;
alter table public.site_content  enable row level security;

drop policy if exists admins_read on public.admins;
create policy admins_read on public.admins for select using (public.is_admin());

drop policy if exists events_admin_read on public.events;
create policy events_admin_read on public.events for select using (public.is_admin());

drop policy if exists notif_admin_all on public.notifications;
create policy notif_admin_all on public.notifications for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists messages_admin_all on public.messages;
create policy messages_admin_all on public.messages for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select
  using (published or public.is_admin());
drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists skills_public_read on public.skills;
create policy skills_public_read on public.skills for select using (true);
drop policy if exists skills_admin_write on public.skills;
create policy skills_admin_write on public.skills for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists content_public_read on public.site_content;
create policy content_public_read on public.site_content for select using (true);
drop policy if exists content_admin_write on public.site_content;
create policy content_admin_write on public.site_content for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. TEMPS RÉEL : la cloche reçoit les nouvelles notifications en direct
-- ---------------------------------------------------------------------
do $$
begin
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.messages;      exception when duplicate_object then null; end;
end $$;

-- ---------------------------------------------------------------------
-- 8. STOCKAGE : bucket public « media » pour la photo de profil
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects for all
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- ---------------------------------------------------------------------
-- 9. DONNÉES INITIALES (modifiables ensuite depuis /admin)
-- ---------------------------------------------------------------------
insert into public.projects (title, category, description, tech, link, icon, sort) values
 ('Itantsoroka', 'mobile', 'Plateforme de monographie communale (Flutter + Node.js).', 'Flutter · Dart · Node.js · PostgreSQL', 'https://github.com/ramaherison13', 'fa-mobile-screen', 1),
 ('Portail de suivi citoyen', 'web', 'Suivi des démarches administratives pour citoyens et agents.', 'React · Express · PostgreSQL', 'https://github.com/ramaherison13', 'fa-globe', 2),
 ('Supervision réseau locale', 'web', 'Scripts et tableaux de bord de monitoring et de sauvegarde.', 'Linux · Bash · Docker', '', 'fa-server', 3),
 ('Interface Itantsoroka', 'design', 'Conception de l''interface et du système visuel de l''application.', 'UI / UX · Figma', '', 'fa-pen-nib', 4)
on conflict do nothing;

insert into public.skills (name, level, sort) values
 ('Flutter / Dart', 92, 1), ('React / JavaScript', 82, 2),
 ('Node.js / Express', 84, 3), ('PostgreSQL / MySQL', 82, 4)
on conflict do nothing;

insert into public.site_content (key, value) values
 ('hero_name', 'Lucien'),
 ('roles', 'Développeur Web,Développeur Mobile,Designer UI,Freelance'),
 ('about_1', 'Étudiant en Master Informatique à l''ENI de Fianarantsoa, je conçois des applications mobiles fluides et des architectures web robustes.'),
 ('about_2', 'Mon travail porte sur des outils numériques à fort impact, comme Itantsoroka, une plateforme dédiée à la monographie communale et à l''information citoyenne.'),
 ('email', 'lucienrandrianirina0@gmail.com'),
 ('phone', '+261 34 01 805 49'),
 ('location', 'Toliara II & Fianarantsoa, Madagascar'),
 ('github', 'https://github.com/ramaherison13'),
 ('linkedin', 'https://www.linkedin.com/in/ramaherison-lucien-randrianirina-8461a3288/'),
 ('photo_url', ''),
 ('cv_url', '/cv.pdf')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- 10. DERNIÈRE ÉTAPE (à faire à la main) :
--     1) Créez votre compte : Authentication > Users > Add user
--     2) Puis exécutez, avec VOTRE email :
--        insert into public.admins (email) values ('vous@exemple.com');
-- ---------------------------------------------------------------------
