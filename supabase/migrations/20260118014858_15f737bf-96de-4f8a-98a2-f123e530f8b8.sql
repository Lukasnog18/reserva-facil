-- Insert sample rooms for the existing user
INSERT INTO salas (user_id, nome, descricao, capacidade) VALUES
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', 'Sala de Reuniões A', 'Sala principal com projetor e videoconferência', 12),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', 'Sala de Reuniões B', 'Sala menor para reuniões rápidas', 6),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', 'Auditório', 'Espaço amplo para apresentações e eventos', 50),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', 'Sala de Treinamento', 'Equipada com computadores e lousa digital', 20),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', 'Sala Executiva', 'Sala exclusiva para diretoria', 8);

-- Insert sample reservations
INSERT INTO reservas (user_id, sala_id, data, hora_inicio, hora_fim, observacao) VALUES
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', (SELECT id FROM salas WHERE nome = 'Sala de Reuniões A' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '09:00', '10:30', 'Reunião de planejamento'),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', (SELECT id FROM salas WHERE nome = 'Sala de Reuniões B' LIMIT 1), CURRENT_DATE + INTERVAL '1 day', '14:00', '15:00', 'Alinhamento de projeto'),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', (SELECT id FROM salas WHERE nome = 'Auditório' LIMIT 1), CURRENT_DATE + INTERVAL '2 days', '10:00', '12:00', 'Apresentação trimestral'),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', (SELECT id FROM salas WHERE nome = 'Sala de Treinamento' LIMIT 1), CURRENT_DATE + INTERVAL '3 days', '08:00', '17:00', 'Treinamento de novos colaboradores'),
  ('4b7b164b-5367-47f6-bd0c-540ff6ec90bb', (SELECT id FROM salas WHERE nome = 'Sala Executiva' LIMIT 1), CURRENT_DATE + INTERVAL '4 days', '11:00', '12:00', 'Reunião com diretoria');