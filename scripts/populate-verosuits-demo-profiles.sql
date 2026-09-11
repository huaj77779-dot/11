-- Populate only blank demonstration profiles for the Verosuits store account.
-- Existing profiles saved by a store are intentionally left unchanged.
UPDATE customers
SET
  measurements = '{
    "jacket:前衣长":["74","75"],"jacket:后中长":["71","72"],"jacket:左袖长":["61","62"],"jacket:右袖长":["61","62"],"jacket:肩宽":["45","45.5"],"jacket:胸围":["98","106"],"jacket:中腰":["88","96"],"jacket:肚围":["90","98"],"jacket:下摆":["100","108"],"jacket:袖肥":["34","36"],"jacket:袖肘":["29","31"],"jacket:袖口":["14","15"],"jacket:领窝":["42","43"],
    "trousers:腰围":["86","88"],"trousers:臀围":["98","102"],"trousers:大腿围":["56","58"],"trousers:膝围":["42","44"],"trousers:小腿围":["38","40"],"trousers:裤口":["36","37"],"trousers:立裆":["27","29"],"trousers:全裆":["74","76"],"trousers:裤长 左":["101","102"],"trousers:裤长 右":["101","102"],
    "waistcoat:前衣长":["61","62"],"waistcoat:后衣长":["55","56"],"waistcoat:胸围":["98","102"],"waistcoat:腰围":["90","94"],"waistcoat:下摆":["96","100"],"waistcoat:肩宽":["36","37"],"waistcoat:领窝":["40","41"],
    "shirt:领围":["39","40"],"shirt:肩宽":["45","46"],"shirt:胸围":["98","110"],"shirt:肚围":["90","102"],"shirt:摆围":["100","110"],"shirt:袖肥":["34","37"],"shirt:腕围":["18","20"],"shirt:长袖长":["61","62"],"shirt:前衣长":["74","75"],"shirt:后衣长":["76","77"],
    "__posture":{"驼背":"正常背","凸肚":"正常肚","挺胸":"正常胸","左平溜肩":"正常肩","右平溜肩":"正常肩"}
  }',
  measurements_saved_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP
WHERE owner_id = 2 AND (measurements IS NULL OR measurements = '{}' OR measurements = '');
