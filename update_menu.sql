-- Update menu categories to match data.js
-- Update existing menu items or insert new ones

-- Update menu item 5 to Rooibos
UPDATE menu SET menu_name = 'Rooibos', menu_image = '/user/assets/menu_5.jpg' WHERE id = 5;

-- Update menu item 6 to Infusions  
UPDATE menu SET menu_name = 'Infusions', menu_image = '/user/assets/menu_6.jpg' WHERE id = 6;

-- Update menu item 7 to Teas
UPDATE menu SET menu_name = 'Teas', menu_image = '/user/assets/menu_7.jpg' WHERE id = 7;

-- Update menu item 8 to Matcha Tea
UPDATE menu SET menu_name = 'Matcha Tea', menu_image = '/user/assets/menu_8.jpg' WHERE id = 8;

-- If the above updates don't work (records don't exist), insert them
INSERT IGNORE INTO menu (id, menu_name, menu_image) VALUES
(5, 'Rooibos', '/user/assets/menu_5.jpg'),
(6, 'Infusions', '/user/assets/menu_6.jpg'),
(7, 'Teas', '/user/assets/menu_7.jpg'),
(8, 'Matcha Tea', '/user/assets/menu_8.jpg');
