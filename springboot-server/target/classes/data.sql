INSERT INTO buffet_packages (id, name, description, price_per_person, type, image_url, is_active)
SELECT 'pkg-seed-1', 'Ocean Bounty Seafood Night', 'A premium selection of fresh oysters, lobsters, and grilled fish.', 85, 'DINNER', 'https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&q=80&w=1000', true
WHERE NOT EXISTS (SELECT 1 FROM buffet_packages WHERE id = 'pkg-seed-1');

INSERT INTO buffet_packages (id, name, description, price_per_person, type, image_url, is_active)
SELECT 'pkg-seed-2', 'Artisanal Sunday Brunch', 'Handcrafted pastries, organic eggs, and bottomless mimosas.', 45, 'BRUNCH', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=1000', true
WHERE NOT EXISTS (SELECT 1 FROM buffet_packages WHERE id = 'pkg-seed-2');
