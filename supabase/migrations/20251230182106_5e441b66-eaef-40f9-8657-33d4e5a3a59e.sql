-- Add metric_type to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS metric_type text NOT NULL DEFAULT 'time';
-- metric_type values: 'time' (lower is better), 'count' (higher is better), 'score' (higher is better)

-- Clear existing data and add new game modes
DELETE FROM public.runs;
DELETE FROM public.categories;
DELETE FROM public.gamemodes;

-- Insert new game modes
INSERT INTO public.gamemodes (name, slug, description, icon, display_order) VALUES
('SkyWars', 'skywars', 'Battle royale on floating islands', 'Swords', 1),
('BedWars', 'bedwars', 'Protect your bed and destroy others', 'Bed', 2),
('Lava Rising', 'lava-rising', 'Survive the rising lava', 'Flame', 3),
('One in the Chamber', 'one-in-the-chamber', 'One shot, one kill', 'Target', 4);

-- Insert SkyWars categories
INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Most Kills', 'most-kills', 'Highest number of kills in a single game', 'count', 'Submit your highest kill count from a single SkyWars match. Video must show the full match.', 1
FROM public.gamemodes WHERE slug = 'skywars';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Fastest Win', 'fastest-win', 'Quickest time to win a match', 'time', 'Timer starts when the game begins. Timer ends when victory is announced. Video must show full match.', 2
FROM public.gamemodes WHERE slug = 'skywars';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Highest Win Streak', 'highest-win-streak', 'Most consecutive wins', 'count', 'Submit your highest win streak. Video proof of each win in the streak required.', 3
FROM public.gamemodes WHERE slug = 'skywars';

-- Insert BedWars categories
INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Fastest Bed Break', 'fastest-bed-break', 'Quickest time to break an enemy bed', 'time', 'Timer starts when the game begins. Timer ends when enemy bed is broken. Video must show full sequence.', 1
FROM public.gamemodes WHERE slug = 'bedwars';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Most Final Kills', 'most-final-kills', 'Highest number of final kills in a single game', 'count', 'Submit your highest final kill count. Video must show the full match.', 2
FROM public.gamemodes WHERE slug = 'bedwars';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Longest Win Streak', 'longest-win-streak', 'Most consecutive wins', 'count', 'Submit your longest win streak. Video proof of each win required.', 3
FROM public.gamemodes WHERE slug = 'bedwars';

-- Insert Lava Rising categories
INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Longest Survival Time', 'longest-survival', 'Longest time survived', 'time', 'Timer starts when the match begins. Timer ends when eliminated. Higher time is better. Video must show full run.', 1
FROM public.gamemodes WHERE slug = 'lava-rising';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Highest Level Reached', 'highest-level', 'Highest level/floor reached', 'count', 'Submit the highest level you reached. Video must show the level indicator clearly.', 2
FROM public.gamemodes WHERE slug = 'lava-rising';

-- Insert One in the Chamber categories
INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Highest Score', 'highest-score', 'Highest score in a single match', 'score', 'Submit your highest score. Video must show the final score screen.', 1
FROM public.gamemodes WHERE slug = 'one-in-the-chamber';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Most Kills', 'most-kills', 'Highest number of kills in a single match', 'count', 'Submit your highest kill count. Video must show the full match.', 2
FROM public.gamemodes WHERE slug = 'one-in-the-chamber';

INSERT INTO public.categories (gamemode_id, name, slug, description, metric_type, rules, display_order)
SELECT id, 'Fastest Match Win', 'fastest-match-win', 'Quickest time to win a match', 'time', 'Timer starts when the match begins. Timer ends at victory. Video must show full match.', 3
FROM public.gamemodes WHERE slug = 'one-in-the-chamber';