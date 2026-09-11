-- Fictional long-term partner-store demo: every customer collects from one London store.
UPDATE customers SET country='United Kingdom', region='England', city='London', street='Verosuits London Store, 14 Wren Street', postal_code='EC1A 1BB', notes='Demo customer — collection at Verosuits London Store' WHERE owner_id=2;
UPDATE orders SET shipping_address='{"deliveryMethod":"store-pickup","store":"Verosuits London Store","address":"14 Wren Street, London EC1A 1BB","country":"United Kingdom"}', updated_at=CURRENT_TIMESTAMP WHERE owner_id=2;

WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 330)
INSERT INTO customers (owner_id,name,height,weight,channel_code,country,region,city,street,postal_code,notes,measurements,total_orders,total_spent,last_order_at)
SELECT 2,
  printf('%s %s %03d',
    CASE n % 12 WHEN 0 THEN 'Oliver' WHEN 1 THEN 'George' WHEN 2 THEN 'Arthur' WHEN 3 THEN 'Harry' WHEN 4 THEN 'Edward' WHEN 5 THEN 'William' WHEN 6 THEN 'Thomas' WHEN 7 THEN 'Samuel' WHEN 8 THEN 'Henry' WHEN 9 THEN 'James' WHEN 10 THEN 'Charles' ELSE 'Alexander' END,
    CASE n % 12 WHEN 0 THEN 'Bennett' WHEN 1 THEN 'Harrison' WHEN 2 THEN 'Whitfield' WHEN 3 THEN 'Collins' WHEN 4 THEN 'Fletcher' WHEN 5 THEN 'Mason' WHEN 6 THEN 'Crawford' WHEN 7 THEN 'Parker' WHEN 8 THEN 'Lawson' WHEN 9 THEN 'Turner' WHEN 10 THEN 'Hughes' ELSE 'Taylor' END,
    n),
  printf('%d cm',174 + (n % 17)), printf('%d kg',68 + (n % 25)), printf('DEMO-UK-%03d',n),
  'United Kingdom','England','London','Verosuits London Store, 14 Wren Street','EC1A 1BB',
  'Demo customer — collection at Verosuits London Store','{}',CASE WHEN n<=88 THEN 3 ELSE 2 END,CASE WHEN n<=88 THEN 5100 ELSE 3100 END,'2026-09-05 10:00:00'
FROM seq WHERE NOT EXISTS (SELECT 1 FROM customers WHERE owner_id=2 AND channel_code=printf('DEMO-UK-%03d',n));

WITH order_steps(n) AS (SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3)
INSERT INTO orders (owner_id,order_no,customer_id,customer_snapshot,status,payment_status,garment_type,garment_name,fabric_code,fabric_name,fabric_mill,base_price,fabric_price,option_extra,shipping_fee,total_price,currency,weight_kg,options,measurements,shipping_address,channel_code,created_at,updated_at)
SELECT 2,printf('DEMO-UK-%03d-%d',CAST(SUBSTR(c.channel_code,9) AS INTEGER),s.n),c.id,
  '{"deliveryMethod":"store-pickup","store":"Verosuits London Store","address":"14 Wren Street, London EC1A 1BB","country":"United Kingdom"}',
  CASE s.n WHEN 1 THEN 'completed' WHEN 2 THEN 'shipped' ELSE 'production' END,'paid',
  CASE s.n WHEN 1 THEN 'jacket' WHEN 2 THEN 'trousers' ELSE 'shirt' END,
  CASE s.n WHEN 1 THEN 'Business Suit Reorder' WHEN 2 THEN 'Pleated Trousers Reorder' ELSE 'Custom Stripe Shirt' END,
  CASE s.n WHEN 1 THEN 'VBC-110-NV' WHEN 2 THEN 'TR-121-NV' ELSE 'SH-102-ST' END,
  CASE s.n WHEN 1 THEN 'Navy Wool' WHEN 2 THEN 'Classic Navy' ELSE 'Blue Stripe' END,
  CASE s.n WHEN 1 THEN 'Vitale Barberis Canonico' WHEN 2 THEN 'House Collection' ELSE 'Albini' END,
  CASE s.n WHEN 1 THEN 1300 WHEN 2 THEN 1080 ELSE 1550 END,0,CASE s.n WHEN 1 THEN 180 WHEN 2 THEN 120 ELSE 250 END,200,CASE s.n WHEN 1 THEN 1680 WHEN 2 THEN 1400 ELSE 2020 END,
  'USD',CASE s.n WHEN 1 THEN 1.3 WHEN 2 THEN 0.7 ELSE 0.4 END,'[]','[]',
  '{"deliveryMethod":"store-pickup","store":"Verosuits London Store","address":"14 Wren Street, London EC1A 1BB","country":"United Kingdom"}',c.channel_code,
  datetime('2026-01-01',printf('+%d days',(CAST(SUBSTR(c.channel_code,9) AS INTEGER)*2+s.n)%245)),'2026-09-05 10:00:00'
FROM customers c CROSS JOIN order_steps s
WHERE c.owner_id=2 AND c.channel_code LIKE 'DEMO-UK-%' AND (s.n<=2 OR CAST(SUBSTR(c.channel_code,9) AS INTEGER)<=88)
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no=printf('DEMO-UK-%03d-%d',CAST(SUBSTR(c.channel_code,9) AS INTEGER),s.n));
