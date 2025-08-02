CREATE TABLE `user` (
  `seq` int NOT NULL AUTO_INCREMENT,
  `id` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`seq`),
  UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE pokeraid.`user` ADD address varchar(100) NULL;
ALTER TABLE pokeraid.`user` ADD private_key varchar(300) NULL;