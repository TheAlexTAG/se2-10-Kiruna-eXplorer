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
	nodeX DOUBLE DEFAULT NULL,
	nodeY DOUBLE DEFAULT NULL,
	`type` VARCHAR(30) NOT NULL,
	`language` VARCHAR(30),
	pages VARCHAR(50),
	FOREIGN KEY (zoneID) REFERENCES `zone`(zoneID) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE link (
	linkID INT AUTO_INCREMENT PRIMARY KEY,
	firstDoc INT NOT NULL,
	secondDoc INT NOT NULL,
	relationship ENUM('Direct consequence', 'Collateral consequence', 'Projection', 'Update'),
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

CREATE OR REPLACE TRIGGER unique_links_insert
BEFORE INSERT ON link
FOR EACH ROW
BEGIN
	 DECLARE links_number INT;
	IF NEW.firstDoc = NEW.secondDoc THEN
		SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Links must be between two different documents';
   END IF;
   SELECT COUNT(*) INTO links_number
   FROM link
   WHERE 
      ((firstDoc = NEW.firstDoc AND secondDoc = NEW.secondDoc) 
      OR (secondDoc = NEW.firstDoc AND firstDoc = NEW.secondDoc))
      AND Relationship = NEW.Relationship;
   IF links_number != 0 THEN
      SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Duplicate link with the same relationship is not allowed';
   END IF;
END$$

CREATE OR REPLACE TRIGGER unique_links_upate
BEFORE UPDATE ON link
FOR EACH ROW
BEGIN
	DECLARE links_number INT;
	IF NEW.firstDoc = NEW.secondDoc THEN
		SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Links must be between two different documents';
   END IF;
   SELECT COUNT(*) INTO links_number
   FROM link
   WHERE 
      ((firstDoc = NEW.firstDoc AND secondDoc = NEW.secondDoc) 
      OR (secondDoc = NEW.firstDoc AND firstDoc = NEW.secondDoc))
      AND relationship = NEW.relationship;
   IF links_number != 0 THEN
      SIGNAL SQLSTATE '45000' 
      SET MESSAGE_TEXT = 'Duplicate link with the same relationship is not allowed';
   END IF;
END$$
DELIMITER ;

INSERT INTO user (userid, username, password, salt, role) VALUES
(null, 'up', 'ef89d2ba51b91f79c2319169a341381eaacd02c4cc3b548cf540ea4b1f148ad9', 'ce3f584e06ec9fc06b92edf73cd9f569', 'Urban Planner'),
(null, 'admin', 'ef89d2ba51b91f79c2319169a341381eaacd02c4cc3b548cf540ea4b1f148ad9', 'ce3f584e06ec9fc06b92edf73cd9f569', 'Admin');

INSERT INTO `zone`(coordinates) VALUES
('POLYGON((20.219392837295374 67.85149346333421, 20.216740850716945 67.85111257582338, 20.219013982069697 67.84720812016931, 20.221034543272452 67.84387453111864, 20.219519122371054 67.8429219896075, 20.221287113423784 67.84215992839822, 20.218508841769648 67.84192177916603, 20.2187614119197 67.83958778805382, 20.227475082106395 67.84049283272685, 20.229116788084752 67.84306487331341, 20.229748213460454 67.84377927871745, 20.229243073159125 67.84535089360782, 20.23000078361045 67.84582711964245, 20.224317955227917 67.84735097762643, 20.223433959700913 67.85120779828412, 20.22444424030226 67.8514458527356, 20.223307674626568 67.85182673480352, 20.219392837295374 67.85149346333421))'),
('POLYGON((20.316776653675703 67.84768180516011, 20.297141939500676 67.85649402644228, 20.295116135658304 67.85537799591475, 20.3016610403823 67.8519120869365, 20.299791067604872 67.85132459368114, 20.290129541581564 67.85614160152014, 20.28623376496023 67.85620033937712, 20.285298778569995 67.85273455263126, 20.28296131259745 67.85285204536268, 20.280935508753515 67.85631781464707, 20.273455617639286 67.85643528932513, 20.272364800185613 67.8544381393009, 20.277195563197182 67.8505020782604, 20.28342880579109 67.85091333959673, 20.28467545431144 67.84844566279665, 20.271897306990468 67.8454488471011, 20.277195563197182 67.84474365804374, 20.28919455519295 67.84838690540505, 20.30228436464239 67.84844566279665, 20.316776653675703 67.84768180516011))'),
('POLYGON((20.20639122940088 67.85862825793728, 20.212732618595822 67.85544133829652, 20.2171523747011 67.85080504114305, 20.222148620732355 67.8361656811918, 20.234831399121163 67.83587570012043, 20.24309442140475 67.85167441707196, 20.218689681172407 67.86319058909814, 20.20735204594621 67.86181474199265, 20.20639122940088 67.85862825793728))'),
('POLYGON((20.316494916383988 67.84765781141633, 20.316962255898005 67.84824520388148, 20.31322353978723 67.8509470187123, 20.304344089023516 67.85464682251884, 20.279575094788584 67.85863960289001, 20.274122800460134 67.85634970953328, 20.273499681109172 67.85511659687549, 20.274901699649718 67.85358979561207, 20.277082617381353 67.85206289437738, 20.278328856084983 67.8509470187123, 20.278173076248038 67.8497723550677, 20.277549956895456 67.84853889456733, 20.280509773816675 67.8483039423144, 20.288766105227808 67.84842141873676, 20.316494916383988 67.84765781141633))'),
('POLYGON((20.297700126524404 67.84836506650316, 20.308609676379803 67.84813966568689, 20.30905801404529 67.84943569063643, 20.3058449274441 67.84912577817789, 20.30382740795031 67.85022454013173, 20.299045139520757 67.84943569063643, 20.298970416576225 67.84909760411387, 20.297700126524404 67.84904125588358, 20.297700126524404 67.84836506650316))'),
('POLYGON((20.297712064215744 67.8483319923383, 20.297836542174565 67.84912988411767, 20.29920579971943 67.84912988411767, 20.303058904799798 67.85002161321879, 20.30524612750159 67.84878459994593, 20.30731512194683 67.84904092339997, 20.306989994248084 67.84819393082739, 20.297679519243275 67.84831652376118))'),
('POLYGON((20.147411862110943 67.88246599751986, 20.408034464737142 67.84035001279423, 20.30974031883764 67.78957450314283, 20.158207943468966 67.80866025972387, 20.157273612722236 67.88064692198918))'),
('POLYGON((20.220888985818817 67.85627329616645, 20.212007420008888 67.85481306607818, 20.210192218453017 67.85642938804887, 20.208179575847964 67.85614130165084, 20.206880274926107 67.85758169804703, 20.204001431705507 67.85720720354439, 20.203313566511184 67.85815783169022, 20.210471085573943 67.85906979932739, 20.212028882234677 67.8575041152144,  20.218952422950707 67.8584826801069, 20.221202573684394 67.85629716194603))'),
('POLYGON((20.198554743621827 67.85471852559874, 20.22099747066835 67.86005300592501, 20.25031454653913 67.84511338483088, 20.229489313334 67.84061437964235, 20.237576782539293 67.83763998467566, 20.229489313334 67.83519917231087, 20.198352556892388 67.85479474105435))'),
('POLYGON((20.229205176385562 67.85344924945335, 20.243603534031507 67.85422464347221, 20.24520335154699 67.84961497788018,  20.231833448019927 67.84879634386684, 20.22931944906651 67.85336309297082))');


INSERT INTO `document` (title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, `type`, `language`, pages) VALUES
('Compilation of responses “So what the people of Kiruna think?” (15)', 'This document is a compilation of the responses to the survey \'What is your impression of Kiruna?\' From the citizens\' responses to this last part of the survey, it is evident that certain buildings, such as the Kiruna Church, the Hjalmar Lundbohmsgården, and the Town Hall, are considered of significant value to the population. The municipality views the experience of this survey positively, to the extent that over the years it will propose various consultation opportunities.', NULL, NULL, NULL, 'Kiruna kommun,Citizens', 'Text', '2007', 'Informative doc.', 'Swedish', NULL),
('Detail plan for Bolagsomradet Gruvstadspark (18)', 'This is the first of 8 detailed plans located in the old center of Kiruna, aimed at transforming the residential areas into mining industry zones to allow the demolition of buildings. The area includes the town hall, the Ullspiran district, and the A10 highway, and it will be the first to be dismantled. The plan consists, like all detailed plans, of two documents: the area map that regulates it, and a text explaining the reasons that led to the drafting of the plan with these characteristics. The plan gained legal validity in 2012.', 1, 67.84530668227652, 20.223135860443843, 'Kiruna kommun', '1:8,000', '20/10/2010', 'Prescriptive doc.', 'Swedish', '1-32'),
('Development Plan (41)', 'The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.', 2, 67.85139942982272, 20.29117388528324, 'Kiruna kommun,Architecture firms', '1:7,500', '17/03/2014', 'Design doc.', 'Swedish', '111'),
('Deformation forecast (45)', 'The development plan shapes the form of the new city. The document, unlike previous competition documents, is written entirely in Swedish, which reflects the target audience: the citizens of Kiruna. The plan obviously contains many elements of the winning masterplan from the competition, some recommended by the jury, and others that were deemed appropriate to integrate later. The document is divided into four parts, with the third part, spanning 80 pages, describing the shape the new city will take and the strategies to be implemented for its relocation through plans, sections, images, diagrams, and texts. The document also includes numerous studies aimed at demonstrating the future success of the project.', 3, 67.85169947085649, 20.220299048884335, 'LKAB', '1:12,000', '12/2014', 'Technical doc.', 'Swedish', '1'),
('Adjusted development plan (47)', 'This document is the update of the Development Plan, one year after its creation, modifications are made to the general master plan, which is published under the name \'Adjusted Development Plan91,\' and still represents the version used today after 10 years. Certainly, there are no drastic differences compared to the previous plan, but upon careful comparison, several modified elements stand out. For example, the central square now takes its final shape, as well as the large school complex just north of it, which appears for the first time.', 4, 67.85165993465826, 20.288109604482475, 'Kiruna kommun,Architecture firms', '1:7,500', '2015', 'Design doc.', 'Swedish', '1'),
('Detail plan for square and commercial street (50)', 'This plan, approved in July 2016, is the first detailed plan to be implemented from the new masterplan (Adjusted development plan). The document defines the entire area near the town hall, comprising a total of 9 blocks known for their density. Among these are the 6 buildings that will face the main square. The functions are mixed, both public and private, with residential being prominent, as well as the possibility of incorporating accommodation facilities such as hotels. For all buildings in this plan, the only height limit is imposed by air traffic.', 5, 67.84910816147125, 20.30259447937066, 'Kiruna kommun', '1:1,000', '22/06/2016', 'Prescriptive doc.', 'Swedish', '1-43'),
('Construction of Scandic Hotel begins (63)', 'After two extensions of the land acquisition agreement, necessary because this document in Sweden is valid for only two years, construction of the hotel finally began in 2019.', NULL, 67.8485, 20.3048, 'LKAB', 'Blueprints/effects', '04/2019', 'Material effect', NULL, NULL),
('Town Hall demolition (64)', 'After the construction of the new town hall was completed, the old building, nicknamed "The Igloo," was demolished. The only elements preserved were the door handles, a masterpiece of Sami art made of wood and bone, and the clock tower, which once stood on the roof of the old town hall. The clock tower was relocated to the central square of New Kiruna, in front of the new building.', NULL, 67.8525, 20.2225, 'LKAB', 'Blueprints/effects', '04/2019', 'Material effect', NULL, NULL),
('Construction of Aurora Center begins (65)', 'Shortly after the construction of the Scandic hotel began, work on the Aurora Center also started, a multifunctional complex that includes the municipal library of Kiruna. The two buildings are close to each other and connected by a skywalk, just like in the old town center.', NULL, 67.8491, 20.3044, 'LKAB', 'Blueprints/effects', '05/2019', 'Material effect', NULL, NULL),
('Construction of Block 1 begins (69)', 'Simultaneously with the start of construction on the Aurora Center, work also began on Block 1, another mixed-use building overlooking the main square and the road leading to old Kiruna. These are the first residential buildings in the new town.', NULL, 67.8485, 20.3003, 'LKAB', 'Blueprints/effects', '06/2019', 'Material effect', NULL, NULL),
('Vision 2099 (4)', 'Vision 2099 is to be considered the first project for the new city of Kiruna. It was created by the municipality in response to the letter from LKAB. In these few lines, all the main aspects and expectations of the municipality for the new city are condensed. The document, which despite being a project document is presented anonymously, had the strength to influence the design process. The principles it contains proved to be fundamental in subsequent planning documents.', NULL, NULL, NULL, 'Kiruna kommun', 'Text', '2004', 'Design doc.', 'Swedish', '2-2'),
('Mail to Kiruna kommun (2)', 'This document is considered the act that initiates the process of relocating Kiruna. The company communicatesmits intention to construct a new mining level at a depth of 1,365 meters. Along with this, LKAB urges the municipality to begin the necessary planning to relocate the city, referring to a series of meetings held in previous months between the two stakeholders.', NULL, NULL, NULL, 'LKAB', 'Text', '19/03/2004', 'Prescriptive doc.', 'Swedish', '1'),
('Construction of new city hall begins (48)', 'The Kiruna Town Hall was the first building to be rebuild in the new town center in 2015. It remained isolated for quite some time due to a slowdown in mining activities.', NULL, 69.4414, 20.5081, 'LKAB', 'Blueprints/effects', '2015', 'Material effect', NULL, NULL),
('Demolition documentation, Kiruna City Hall (76)', 'This document was created to preserve the memory of the symbolic building before its demolition in April 2019. Conducted by the Norrbotten Museum, the detailed 162-page study analyzed the building\'s materials, both physically and chemically, taking advantage of the demolition to explore aspects that couldn\'t be examined while it was in use. This meticulous effort reflects a commitment to preserving knowledge of every detail of the structure.', NULL, 67.8492, 20.3044, 'Norbotten Museum', 'Text', '26/11/2020', 'Informative doc.', 'Swedish', '162'),
('Kiruna Church closes (102)', 'On June 2, the Kiruna Church was closed to begin the necessary preparations for its relocation, following a solemn ceremony. The relocation is scheduled for the summer of 2025 and will take two days. Both the new site and the route for the move have already been determined. A significant period will pass between the relocation and the reopening of the church, voted "Sweden\'s most beautiful building constructed before 1950.', NULL, 68.4219, 20.3921, 'LKAB', 'Blueprints/effects', '02/06/2024', 'Material effect', NULL , NULL),
('Detail plan for square and commercial street (49)', 'This plan, approved in July 2016, is the first detailed plan to be implemented from the new masterplan (Adjusted development plan). The document defines the entire area near the town hall, comprising a total of 9 blocks known for their density. Among these are the 6 buildings that will face the main square. The functions are mixed, both public and private, with residential being prominent, as well as the possibility of incorporating accommodation facilities such as hotels. For all buildings in this plan, the only height limit is imposed by air traffic.', 6, 67.84879887, 20.30250208, 'Kiruna kommun', '1:1,000', '22/06/2016', 'Prescriptive doc.', 'Swedish' , '1-43'),
('Detail plan for LINBANAN 1. (42)', 'This is the first Detailed Plan for the new city center, covering a very small area. It regulates the use of a portion of land that will host a single building. Its boundaries coincide with the outer footprint of the new Town Hall, "Kristallen," the first building to be constructed in the new Kiruna.', NULL, 67.84869659436492, 20.305672481097133, 'Kiruna kommun', '1:500', '03/2014', 'Prescriptive doc.', 'Swedish' , '1-15'),
('Detail Overview Plan for the Central Area of Kiruna 2014. (44)', 'The Detailed Overview Plan is one of the three planning instruments available to Swedish administrations and represents an intermediate scale. Like the Overview Plan, compliance with it is not mandatory, but it serves as a supporting plan for Detailed Plans, sharing the characteristic of regulating a specific area of the Kiruna municipality rather than its entire extent, as the Overview Plan does. This specific plan focuses on the central area of Kiruna and its surroundings, incorporating all the projections of the Development Plan into a prescriptive tool.', 7, 67.83494928, 20.26714504, 'Kiruna kommun', '1:30,000', '06/2014', 'Prescriptive doc.', 'Swedish' , '18-136-3-1'),
('Detail plan for Gruvstaspark 2, etapp 3, del av SJ-omradet m m. (58)', 'The third Detailed Plan of the second demolition phase covers a narrow, elongated area straddling the old railway. Like all areas within the "Gruvstadpark 2" zone, its sole designated land use is for mining activities, although it will temporarily be used as a park during an interim phase.', 8, 67.85696513, 20.21107943, 'Kiruna kommun', '1:1,500', '10/2018', 'Prescriptive doc.', 'Swedish' , '1-46'),
('Deformation forecast (62)', 'The third deformation forecast was published in 2019, five years after the second. The line has not moved; what changes, as in the previous version, are the timing of the interventions and the shape of the areas underlying the deformation zone.', 9, 67.84687188, 20.22436261, 'LKAB', '1:12,000', '04/2019', 'Technical doc.', 'Swedish' , '1'),
('Gruvstadspark 2, etapp 5, Kyrkan (81)', 'The last detailed plan of the second planning phase concerns the area surrounding the Kiruna Church. Situated within a park, the area includes only six buildings, half of which serve religious functions. The plan also specifies that the church will be dismantled between 2025 and 2026 and reassembled at its new site by 2029.', 10, 67.85129, 20.23601, 'Kiruna kommun', '1:2,000', '04/09/2021', 'Prescriptive doc.', 'Swedish' , '1-56');


