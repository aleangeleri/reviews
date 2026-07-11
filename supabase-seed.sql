-- =========================================
-- Dati di partenza (facoltativo)
-- Esegui DOPO supabase-schema.sql, solo se vuoi ripopolare
-- il sito con gli stessi esempi che avevi in localStorage.
-- =========================================

insert into locations (id, name, photo, description) values
('roma', 'Roma', 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80', 'Trattorie sincere, tavole contemporanee e indirizzi da salvare per quando la fame diventa una piccola missione.'),
('milano', 'Milano', 'https://images.unsplash.com/photo-1512237798647-84b57b22b517?auto=format&fit=crop&w=1200&q=80', 'Cene veloci, posti eleganti e scoperte nascoste tra quartieri pieni di energia.'),
('palma-de-mallorca', 'Palma de Mallorca', 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=1200&q=80', 'Tavoli vista mare, tapas, mercati e pause lunghe con il sole che fa la sua parte.'),
('sardegna', 'Sardegna', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', 'Sapori netti, pesce fresco, terrazze luminose e posti da ricordare quando torna voglia d''estate.')
on conflict (id) do nothing;

insert into restaurants (id, location_id, name, address, cover, photos, description, score_location, score_service, score_menu, score_bill) values
('osteria-trastevere', 'roma', 'Osteria Trastevere 53', 'Via della Scala 53, Roma',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1400&q=80',
  array[
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=80'
  ],
  'Atmosfera calda, piatti romani generosi e servizio informale. Perfetto per una cena senza fretta dopo una passeggiata.',
  8.5, 8, 8.8, 7.5),
('brera-table', 'milano', 'Brera Table', 'Via Solferino 18, Milano',
  'https://images.unsplash.com/photo-1559329007-40df8a9345d8?auto=format&fit=crop&w=1400&q=80',
  array[
    'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1533777324565-a040eb52fac1?auto=format&fit=crop&w=900&q=80'
  ],
  'Una cucina pulita e moderna, bella carta dei vini e conto coerente con la zona. Ideale quando si vuole qualcosa di curato.',
  8, 8.7, 8.4, 7.8)
on conflict (id) do nothing;
