USE kiruna_explorer;

INSERT INTO `zone` (coordinates) VALUES
    ('POLYGON((20.175 67.870, 20.195 67.870, 20.195 67.890, 20.175 67.890, 20.175 67.870))'),
    ('POLYGON((20.200 67.850, 20.220 67.850, 20.220 67.870, 20.200 67.870, 20.200 67.850))'),
    ('POLYGON((20.150 67.860, 20.170 67.860, 20.170 67.880, 20.150 67.880, 20.150 67.860))');

INSERT INTO `document` (title, description, zoneID, latitude, longitude, stakeholders, scale, issuanceDate, parsedDate, type, language, pages) VALUES
    -- Documento associato a tutta l'area di Kiruna (zoneID, latitude, longitude = NULL)
    ('General Plan', 'Plan for the entire Kiruna municipality', NULL, NULL, NULL, 'Public Administration', '1:1000', '2024', '2024-01-01', 'Report', 'English', 120),

    -- Documento associato alla zona 1 (coordinate del centroide della zona 1)
    ('Zone 1 Development', 'Development plan for Zone 1', 1, 67.880, 20.185, 'Urban Planners, Developers', '1:500', '02/2024','2024-02-01', 'Plan', 'Swedish', 30),

    -- Documento con solo latitudine e longitudine (zoneID = NULL)
    ('Special Project', 'Independent project in Kiruna', NULL, 67.860, 20.200, 'Private Companies', '1:100', '12/02/2024','2024-02-01', 'Project', 'English', 15),

    -- Documento associato alla zona 2 (coordinate del centroide della zona 2)
    ('Zone 2 Report', 'Annual report for Zone 2', 2, 67.860, 20.210, 'Local Government', '1:200', '11/03/2001', '2001-03-11', 'Report', 'Swedish', 25);

INSERT INTO `attachment` (documentID, name, path) VALUES
    (1, 'General Plan PDF', '/attachments/general_plan.pdf'),
    (1, 'General Plan PDF1', '/attachments/general_plan1.pdf'),
    (2, 'Zone 1 Map', '/attachments/zone1_map.png'),
    (3, 'Special Project Proposal', '/attachments/special_project_proposal.docx');

INSERT INTO `resource` (documentID, name, path) VALUES
    (1, 'Kiruna Overview', '/resources/kiruna_overview.pdf'),
    (2, 'Development Guidelines', '/resources/development_guidelines.pdf'),
    (3, 'Project Budget', '/resources/project_budget.xlsx');

INSERT INTO `link` (firstDoc, secondDoc, relationship) VALUES
    -- Collegamenti aggiuntivi tra i documenti
    (1, 3, 'Direct consequence'), -- Il documento 1 ha una conseguenza diretta sul documento 3
    (3, 1, 'Collateral consequence'), -- Il documento 3 ha una conseguenza collaterale sul documento 1
    (2, 4, 'Update'), -- Il documento 2 rappresenta un aggiornamento del documento 4
    (4, 2, 'Projection'), -- Il documento 4 è una proiezione del documento 2
    (3, 2, 'Projection'), -- Il documento 3 proietta un risultato sul documento 2
    (4, 1, 'Direct consequence'), -- Il documento 4 ha una conseguenza diretta sul documento 1
    (1, 4, 'Collateral consequence'), -- Il documento 1 causa una conseguenza collaterale sul documento 4
    (2, 3, 'Update'), -- Il documento 2 aggiorna i dati del documento 3
    (3, 4, 'Projection'), -- Il documento 3 proietta scenari previsti dal documento 4
    (4, 3, 'Collateral consequence'); -- Il documento 4 influisce collateralmente sul documento 3


INSERT INTO user (userid, username, password, salt, role) VALUES
(null, 'up', 'ef89d2ba51b91f79c2319169a341381eaacd02c4cc3b548cf540ea4b1f148ad9', 'ce3f584e06ec9fc06b92edf73cd9f569', 'Urban Planner'),
(null, 'admin', 'ef89d2ba51b91f79c2319169a341381eaacd02c4cc3b548cf540ea4b1f148ad9', 'ce3f584e06ec9fc06b92edf73cd9f569', 'Admin');
