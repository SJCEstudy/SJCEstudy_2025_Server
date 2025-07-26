-- pokeraid.shop definition

CREATE TABLE `shop` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('POKETMON','ITEM') NOT NULL,
  `target_id` int NOT NULL,
  `price` int NOT NULL,
  `stock` int DEFAULT '-1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO shop (type, target_id, price, stock) VALUES
('POKETMON', 1, 12, 10),
('POKETMON', 2, 18, 15),
('POKETMON', 3, 15, 8),
('POKETMON', 4, 17, 12),
('POKETMON', 5, 20, 5),
('POKETMON', 6, 11, 9),
('POKETMON', 7, 16, 11),
('POKETMON', 8, 19, 7),
('POKETMON', 9, 14, 20),
('POKETMON', 10, 13, 3);
