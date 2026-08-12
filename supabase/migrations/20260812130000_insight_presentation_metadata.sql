-- Publishing metadata supplied by the active AEO Expert insight skill.
-- The website treats these as presentation/disclosure data, not article body.
alter table public.insights_posts
  add column if not exists tile_colour text,
  add column if not exists ai_image_disclosure text;

alter table public.insights_posts
  drop constraint if exists insights_posts_tile_colour_check;

alter table public.insights_posts
  add constraint insights_posts_tile_colour_check
  check (tile_colour is null or tile_colour in ('emerald', 'orange', 'blue', 'plum'));
