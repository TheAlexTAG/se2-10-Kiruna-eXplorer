CREATE DATABASE kiruna_explorer;

USE kiruna_explorer;

CREATE TABLE `user` (
	userID INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(255) NOT NULL,
	`password` VARCHAR(255) NOT NULL,
	salt VARCHAR(255) NOT NULL,
	`role` ENUM('Urban Planner', 'Urban Developer', 'Admin') NOT NULL
);

CREATE TABLE `zone` (
	zoneID INT AUTO_INCREMENT PRIMARY KEY,
	coordinates TEXT NOT NULL UNIQUE
);

CREATE TABLE document (
	documentID INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	`description` TEXT NOT NULL,
	zoneID INT,
	latitude DOUBLE,
	longitude DOUBLE,
	stakeholders TEXT NOT NULL,
	scale VARCHAR(30) NOT NULL,
	issuanceDate VARCHAR(10) NOT NULL,
	`type` VARCHAR(30) NOT NULL,
	`language` VARCHAR(30),
	pages VARCHAR(50),
	FOREIGN KEY (zoneID) REFERENCES `zone`(zoneID) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE link (
	firstDoc INT NOT NULL,
	secondDoc INT NOT NULL,
	relationship ENUM('Direct consequence', 'Collateral consequence', 'Projection', 'Update'),
	PRIMARY KEY (firstDoc, secondDoc, relationship),
	FOREIGN KEY (firstDoc) REFERENCES document(documentID) ON UPDATE CASCADE ON DELETE CASCADE,
	FOREIGN KEY (secondDoc) REFERENCES document(documentID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE `resource` (
	resourceID INT AUTO_INCREMENT PRIMARY KEY,
	documentID INT NOT NULL,
	`name` VARCHAR(100) NOT NULL,
	`path` VARCHAR(4096) NOT NULL,
	FOREIGN KEY(documentID) REFERENCES document(documentID) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE attachment (
	attachmentID INT AUTO_INCREMENT PRIMARY KEY,
	documentID INT NOT NULL,
	`name` VARCHAR(100) NOT NULL,
	`path` VARCHAR(4096) NOT NULL,
	FOREIGN KEY(documentID) REFERENCES document(documentID) ON UPDATE CASCADE ON DELETE CASCADE
);


DELIMITER $$
CREATE OR REPLACE TRIGGER clear_zone
AFTER UPDATE ON document
FOR EACH ROW
BEGIN
	DECLARE old_zone_docs INT;
	SELECT COUNT(*) INTO old_zone_docs
	FROM document
	WHERE zoneID = OLD.zoneID;
	IF old_zone_docs = 0 THEN
		DELETE FROM `zone` WHERE zoneID = OLD.zoneID;
	END IF;
END;$$
DELIMITER ;