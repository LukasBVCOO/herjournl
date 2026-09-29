-- More affirmation lines, so they don't become repetitive (founder,
-- 2026-09-29). Each house now has five of each kind — theme, goal, belief —
-- instead of one. The app offers one of each kind a day, rotating through
-- all five before any repeats (see affirmations/daily-lines.ts).
--
-- The first line of each kind (the original 39) is variant 1 and keeps its id,
-- so every day she has already practised still points at the same words. New
-- lines use ids 1000 + house * 100 + kind * 10 + variant (kind: theme 1,
-- goal 2, belief 3), clear of the original range.
--
-- Same rules as before: first person, present tense, about ten words, warm
-- and direct, no astrology words.

alter table public.affirmations
  add column variant smallint not null default 1 check (variant between 1 and 9);

alter table public.affirmations
  drop constraint affirmations_house_type_key,
  add constraint affirmations_house_type_variant_key unique (house, type, variant);

insert into public.affirmations (id, house, type, variant, category, text) values
  -- 0 · general (no house)
  (1012, 0, 'theme', 2, 'general', 'I am becoming the woman I imagine.'),
  (1013, 0, 'theme', 3, 'general', 'My energy is focused and clear today.'),
  (1014, 0, 'theme', 4, 'general', 'I move through today with ease and intention.'),
  (1015, 0, 'theme', 5, 'general', 'I live in alignment with what I want.'),
  (1022, 0, 'goal', 2, 'general', 'I finish what I start today.'),
  (1023, 0, 'goal', 3, 'general', 'I give my best energy to what matters most.'),
  (1024, 0, 'goal', 4, 'general', 'I make one bold move toward my dream.'),
  (1025, 0, 'goal', 5, 'general', 'I choose progress over perfection today.'),
  (1032, 0, 'belief', 2, 'general', 'I am ready to receive more.'),
  (1033, 0, 'belief', 3, 'general', 'Good things find me easily.'),
  (1034, 0, 'belief', 4, 'general', 'I trust myself to handle whatever comes.'),
  (1035, 0, 'belief', 5, 'general', 'My dreams are already on their way.'),

  -- 1 · self
  (1112, 1, 'theme', 2, 'self', 'I love who I am becoming.'),
  (1113, 1, 'theme', 3, 'self', 'I lead my life with confidence.'),
  (1114, 1, 'theme', 4, 'self', 'I show up as my full self today.'),
  (1115, 1, 'theme', 5, 'self', 'My presence is magnetic and calm.'),
  (1122, 1, 'goal', 2, 'self', 'I choose myself first today.'),
  (1123, 1, 'goal', 3, 'self', 'I act like the woman I want to be.'),
  (1124, 1, 'goal', 4, 'self', 'I take up space and speak up.'),
  (1125, 1, 'goal', 5, 'self', 'I keep the promises I make to myself.'),
  (1132, 1, 'belief', 2, 'self', 'I am worthy of everything I want.'),
  (1133, 1, 'belief', 3, 'self', 'My confidence grows every single day.'),
  (1134, 1, 'belief', 4, 'self', 'I am allowed to change and begin again.'),
  (1135, 1, 'belief', 5, 'self', 'Being me is my greatest strength.'),

  -- 2 · money
  (1212, 2, 'theme', 2, 'money', 'Money flows to me with ease.'),
  (1213, 2, 'theme', 3, 'money', 'I am a magnet for abundance.'),
  (1214, 2, 'theme', 4, 'money', 'I value my time, my work and myself.'),
  (1215, 2, 'theme', 5, 'money', 'My wealth grows while I rest.'),
  (1222, 2, 'goal', 2, 'money', 'I ask for what I am worth.'),
  (1223, 2, 'goal', 3, 'money', 'I make one smart money choice today.'),
  (1224, 2, 'goal', 4, 'money', 'I save with joy and spend with purpose.'),
  (1225, 2, 'goal', 5, 'money', 'I am creating new streams of income.'),
  (1232, 2, 'belief', 2, 'money', 'I deserve to be paid well.'),
  (1233, 2, 'belief', 3, 'money', 'Abundance is my natural state.'),
  (1234, 2, 'belief', 4, 'money', 'There is always more than enough for me.'),
  (1235, 2, 'belief', 5, 'money', 'I am safe with money, and money is safe with me.'),

  -- 3 · mind
  (1312, 3, 'theme', 2, 'mind', 'My words are clear, kind and confident.'),
  (1313, 3, 'theme', 3, 'mind', 'My mind is sharp and curious today.'),
  (1314, 3, 'theme', 4, 'mind', 'I say what I mean with ease.'),
  (1315, 3, 'theme', 5, 'mind', 'I express myself with confidence.'),
  (1322, 3, 'goal', 2, 'mind', 'I write, share and speak my truth.'),
  (1323, 3, 'goal', 3, 'mind', 'I learn something new today.'),
  (1324, 3, 'goal', 4, 'mind', 'I reach out and start the conversation.'),
  (1325, 3, 'goal', 5, 'mind', 'I focus on one thing at a time.'),
  (1332, 3, 'belief', 2, 'mind', 'My voice deserves to be heard.'),
  (1333, 3, 'belief', 3, 'mind', 'I am smart and I learn with ease.'),
  (1334, 3, 'belief', 4, 'mind', 'The right words always come to me.'),
  (1335, 3, 'belief', 5, 'mind', 'What I have to say matters.'),

  -- 4 · home
  (1412, 4, 'theme', 2, 'home', 'My home holds me with warmth.'),
  (1413, 4, 'theme', 3, 'home', 'I am safe and at peace where I am.'),
  (1414, 4, 'theme', 4, 'home', 'My space reflects the life I want.'),
  (1415, 4, 'theme', 5, 'home', 'I nourish my roots and my family.'),
  (1422, 4, 'goal', 2, 'home', 'I make my space feel like me.'),
  (1423, 4, 'goal', 3, 'home', 'I create calm wherever I go.'),
  (1424, 4, 'goal', 4, 'home', 'I care for the people who feel like home.'),
  (1425, 4, 'goal', 5, 'home', 'I clear space for peace today.'),
  (1432, 4, 'belief', 2, 'home', 'I belong exactly where I am.'),
  (1433, 4, 'belief', 3, 'home', 'I am held, supported and loved.'),
  (1434, 4, 'belief', 4, 'home', 'I deserve a soft place to land.'),
  (1435, 4, 'belief', 5, 'home', 'Peace is always available to me.'),

  -- 5 · creativity
  (1512, 5, 'theme', 2, 'creativity', 'I let joy lead me today.'),
  (1513, 5, 'theme', 3, 'creativity', 'My creativity flows freely.'),
  (1514, 5, 'theme', 4, 'creativity', 'I play, create and shine.'),
  (1515, 5, 'theme', 5, 'creativity', 'My life feels light and full of fun.'),
  (1522, 5, 'goal', 2, 'creativity', 'I make something just because I love it.'),
  (1523, 5, 'goal', 3, 'creativity', 'I follow what excites me today.'),
  (1524, 5, 'goal', 4, 'creativity', 'I share my work with the world.'),
  (1525, 5, 'goal', 5, 'creativity', 'I say yes to pleasure and play.'),
  (1532, 5, 'belief', 2, 'creativity', 'My creativity is a gift.'),
  (1533, 5, 'belief', 3, 'creativity', 'I am allowed to have fun.'),
  (1534, 5, 'belief', 4, 'creativity', 'I shine without holding back.'),
  (1535, 5, 'belief', 5, 'creativity', 'Joy is a worthy use of my time.'),

  -- 6 · routine
  (1612, 6, 'theme', 2, 'routine', 'My routines make me feel strong.'),
  (1613, 6, 'theme', 3, 'routine', 'I care for my body with love.'),
  (1614, 6, 'theme', 4, 'routine', 'My days are calm and well organised.'),
  (1615, 6, 'theme', 5, 'routine', 'Small habits are building my dream life.'),
  (1622, 6, 'goal', 2, 'routine', 'I move my body with joy today.'),
  (1623, 6, 'goal', 3, 'routine', 'I finish my most important task first.'),
  (1624, 6, 'goal', 4, 'routine', 'I rest when I need to.'),
  (1625, 6, 'goal', 5, 'routine', 'I keep today simple and focused.'),
  (1632, 6, 'belief', 2, 'routine', 'Consistency comes easily to me.'),
  (1633, 6, 'belief', 3, 'routine', 'My body is my home, and I honour it.'),
  (1634, 6, 'belief', 4, 'routine', 'I am disciplined and kind to myself.'),
  (1635, 6, 'belief', 5, 'routine', 'Every small effort counts.'),

  -- 7 · relationships
  (1712, 7, 'theme', 2, 'relationships', 'I am surrounded by loving connections.'),
  (1713, 7, 'theme', 3, 'relationships', 'My relationships are honest and warm.'),
  (1714, 7, 'theme', 4, 'relationships', 'Love comes to me easily.'),
  (1715, 7, 'theme', 5, 'relationships', 'I attract people who match my energy.'),
  (1722, 7, 'goal', 2, 'relationships', 'I speak my needs with love.'),
  (1723, 7, 'goal', 3, 'relationships', 'I show up fully for the people I love.'),
  (1724, 7, 'goal', 4, 'relationships', 'I open my heart a little more today.'),
  (1725, 7, 'goal', 5, 'relationships', 'I set boundaries with kindness.'),
  (1732, 7, 'belief', 2, 'relationships', 'I am deeply loveable.'),
  (1733, 7, 'belief', 3, 'relationships', 'The right people stay.'),
  (1734, 7, 'belief', 4, 'relationships', 'I am worthy of a love that feels safe.'),
  (1735, 7, 'belief', 5, 'relationships', 'Healthy love is my normal.'),

  -- 8 · transformation
  (1812, 8, 'theme', 2, 'transformation', 'I am becoming who I am meant to be.'),
  (1813, 8, 'theme', 3, 'transformation', 'I release the past with grace.'),
  (1814, 8, 'theme', 4, 'transformation', 'My power grows as I let go.'),
  (1815, 8, 'theme', 5, 'transformation', 'Change is working in my favour.'),
  (1822, 8, 'goal', 2, 'transformation', 'I release one old habit today.'),
  (1823, 8, 'goal', 3, 'transformation', 'I face what I have been avoiding.'),
  (1824, 8, 'goal', 4, 'transformation', 'I make room for something new.'),
  (1825, 8, 'goal', 5, 'transformation', 'I choose growth over comfort today.'),
  (1832, 8, 'belief', 2, 'transformation', 'Endings make space for better things.'),
  (1833, 8, 'belief', 3, 'transformation', 'I am stronger than I know.'),
  (1834, 8, 'belief', 4, 'transformation', 'I am allowed to outgrow old versions of me.'),
  (1835, 8, 'belief', 5, 'transformation', 'Every change brings me closer to myself.'),

  -- 9 · growth
  (1912, 9, 'theme', 2, 'growth', 'My life is full of adventure.'),
  (1913, 9, 'theme', 3, 'growth', 'I see the bigger picture clearly.'),
  (1914, 9, 'theme', 4, 'growth', 'I am open to new horizons.'),
  (1915, 9, 'theme', 5, 'growth', 'Life is teaching me beautiful things.'),
  (1922, 9, 'goal', 2, 'growth', 'I try something new today.'),
  (1923, 9, 'goal', 3, 'growth', 'I learn from every experience.'),
  (1924, 9, 'goal', 4, 'growth', 'I plan my next adventure.'),
  (1925, 9, 'goal', 5, 'growth', 'I stretch beyond my comfort zone.'),
  (1932, 9, 'belief', 2, 'growth', 'The world is full of opportunities for me.'),
  (1933, 9, 'belief', 3, 'growth', 'My horizons are always expanding.'),
  (1934, 9, 'belief', 4, 'growth', 'I trust the journey I am on.'),
  (1935, 9, 'belief', 5, 'growth', 'There is so much more waiting for me.'),

  -- 10 · career
  (2012, 10, 'theme', 2, 'career', 'My work makes a real difference.'),
  (2013, 10, 'theme', 3, 'career', 'I am recognised for what I create.'),
  (2014, 10, 'theme', 4, 'career', 'My career is growing in the right direction.'),
  (2015, 10, 'theme', 5, 'career', 'I lead with confidence and grace.'),
  (2022, 10, 'goal', 2, 'career', 'I take one clear step toward my ambition.'),
  (2023, 10, 'goal', 3, 'career', 'I show my work with pride today.'),
  (2024, 10, 'goal', 4, 'career', 'I focus on the work that moves me forward.'),
  (2025, 10, 'goal', 5, 'career', 'I claim the opportunities meant for me.'),
  (2032, 10, 'belief', 2, 'career', 'Success comes naturally to me.'),
  (2033, 10, 'belief', 3, 'career', 'I deserve to be seen and rewarded.'),
  (2034, 10, 'belief', 4, 'career', 'I am the right woman for the job.'),
  (2035, 10, 'belief', 5, 'career', 'My ambition is welcome and good.'),

  -- 11 · future
  (2112, 11, 'theme', 2, 'future', 'My dreams are coming to life.'),
  (2113, 11, 'theme', 3, 'future', 'I am part of something bigger.'),
  (2114, 11, 'theme', 4, 'future', 'My people are finding their way to me.'),
  (2115, 11, 'theme', 5, 'future', 'My future is bright and full of possibility.'),
  (2122, 11, 'goal', 2, 'future', 'I reach out to someone who inspires me.'),
  (2123, 11, 'goal', 3, 'future', 'I take one step toward my vision today.'),
  (2124, 11, 'goal', 4, 'future', 'I show up for my community.'),
  (2125, 11, 'goal', 5, 'future', 'I dream bigger than I did yesterday.'),
  (2132, 11, 'belief', 2, 'future', 'My vision is worth building.'),
  (2133, 11, 'belief', 3, 'future', 'I am connected to the right people.'),
  (2134, 11, 'belief', 4, 'future', 'The future I want is already forming.'),
  (2135, 11, 'belief', 5, 'future', 'I belong in rooms that lift me higher.'),

  -- 12 · inner world
  (2212, 12, 'theme', 2, 'inner_world', 'I trust what I feel.'),
  (2213, 12, 'theme', 3, 'inner_world', 'Peace lives within me.'),
  (2214, 12, 'theme', 4, 'inner_world', 'I rest and let life unfold.'),
  (2215, 12, 'theme', 5, 'inner_world', 'My inner world is soft and safe.'),
  (2222, 12, 'goal', 2, 'inner_world', 'I slow down and listen within.'),
  (2223, 12, 'goal', 3, 'inner_world', 'I give myself time to rest today.'),
  (2224, 12, 'goal', 4, 'inner_world', 'I let go of what I cannot control.'),
  (2225, 12, 'goal', 5, 'inner_world', 'I honour my intuition today.'),
  (2232, 12, 'belief', 2, 'inner_world', 'My intuition always guides me well.'),
  (2233, 12, 'belief', 3, 'inner_world', 'It is safe to slow down.'),
  (2234, 12, 'belief', 4, 'inner_world', 'Everything is unfolding in perfect time.'),
  (2235, 12, 'belief', 5, 'inner_world', 'I am held by something greater.');
