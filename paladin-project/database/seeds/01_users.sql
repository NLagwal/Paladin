-- Seed minimal operator accounts
INSERT INTO users (email, password_hash, role)
VALUES 
  ('admin@paladin.local', 'paladin', 'admin'),
  ('operator@paladin.local', 'paladin', 'operator');
