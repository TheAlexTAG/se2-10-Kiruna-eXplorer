## Server API

#### Documents API

- POST `/api/document`
    - description: route for inserting a new document;
    - request body:
    ``` json
    [
        {
            "title": "Document3",
            "description": "This is a sample description3.",
            "zoneID": 3,
            "coordinates": [
                [20.190, 67.870],
                [20.195, 67.870],
                [20.195, 67.890],
                [20.175, 67.890],
                [20.190, 67.870]
            ],
            "latitude": 67.870,
            "longitude": 20.190,
            "stakeholders": "John Doe, Jane Smith",
            "scale": "1:100",
            "issuanceDate": "2001",
            "type": "Report",
            "language": "EN",
            "pages": "1-10"
        }
    ]
    ```
    > #### Zone Specification: 
    > - Wole Kiruna Area: zoneID = 0, latitude = null, longitude = null, coordinates = null;
    > - Non existent zone: ZoneID = null, latitude = null, longitude = null, coordinates: {a geoJson geometry like in the example};
    > - Existent zone: ZoneID = {the id of the existing zone}, latitude: null, longitude: null, coordinates = null.
     
    - response body: 
    ``` json
    [
        1 //the id of the created document
    ]
    ```
    - response:
      - It should return status code `200 Ok` on success;
      - It should return status code `500 Internal Server Error` if the database query throws and error;
      - It should return status code `404 Zone Error` if the custom zone creation fails;
      - It should return status code `400 Insert Zone Error` if the specified zoneID doesn't match any existing zone;
      - It should return status code `400 Coordinates Out of Bounds Error` if the specified latitude and longitude or the coordinates of the new custom area are not in Kiruna Municipal Area;
      - It should return status code `400 Wrong Georeference Error` if the gereference fields don't match the pattern described in [zone specification](#zone-specification);
      - It should return status code `422 Validation Error` if at least one of the body parameters is invalid;
      - It should return status code `401 Authentication Error` if the user performing this API is not logged as a Urban Planner.

- PUT `/api/document/:id`
    - description: route for modifiying a document georeference(soon will be used also for whole document edit);
    - params :
        `id`: the id of the document to be changed;
    - request body:
    ``` json
    [
        {
            "zoneID": 3,
            "coordinates": [
                [20.190, 67.870],
                [20.195, 67.870],
                [20.195, 67.890],
                [20.175, 67.890],
                [20.190, 67.870]
            ],
            "latitude": 67.870,
            "longitude": 20.190
        }
    ]
    ```
    for georeferences contraints see [zone specification](#zone-specification);
    - response body:
    ``` json
    [
        true //otherwise an error
    ]
    ```
    - response:
      - It should return status code `200 Ok` on success;
      - It should return status code `500 Internal Server Error` if the database query throws and error;
      - It should return status code `404 Document Not Found` if the document to modify doesn't exist;
      - It should return status code `404 Zone Error` if the custom zone creation fails;
      - It should return status code `400 Insert Zone Error` if the specified zoneID doesn't match any existing zone;
      - It should return status code `400 Coordinates Out of Bounds Error` if the specified latitude and longitude or the coordinates of the new custom area are not in Kiruna Municipal Area;
      - It should return status code `400 Wrong Georeference Error` if the gereference fields don't match the pattern described in [zone specification](#zone-specification);
      - It should return status code `422 Validation Error` if at least one of the body parameters is invalid;
      - It should return status code `401 Authentication Error` if the user performing this API is not logged as a Urban Planner.

- GET `/api/document/:id`
    - description: route for retrieving a specific document;
    - params :
        `id`: the id of the document to retrieve;
    - request body: none;
    - response body: 
    ``` json
    [
        {
            "id": 1,
            "title": "General Plan",
            "description": "Plan for the entire Kiruna municipality",
            "zoneID": 0,
            "latitude": null,
            "longitude": null,
            "stakeholders": "Public Administration",
            "scale": "1:1000",
            "issuanceDate": "2024",
            "type": "Report",
            "language": "English",
            "pages": "120",
            "connections": 2,
            "attachment": [
                {
                "name": "General Plan PDF",
                "path": "/attachments/general_plan.pdf"
                },
                {
                "name": "General Plan PDF",
                "path": "/attachments/general_plan.pdf"
                }
            ],
            "resource": [
                {
                "name": "Kiruna Overview",
                "path": "/resources/kiruna_overview.pdf"
                },
                {
                "name": "Kiruna Overview",
                "path": "/resources/kiruna_overview.pdf"
                }
            ],
            "links": [
                {
                "documentID": 3,
                "relationship": "Direct consequence"
                },
                {
                "documentID": 4,
                "relationship": "Collateral consequence"
                }
            ]
        }
    ]
    ```
    - response:
      - It should return status code `200 Ok` on success;
      - It should return status code `500 Internal Server Error` if the database query throws and error;
      - It should return status code `404 Document Not Found` if the document to modify doesn't exist.

- GET `/api/documents`
    - description: route for retrieving all documents. Pagination and filters can be activated through query params;
    - query params: 
        `ZoneID`: the id of the zone;
        `stakeholders`: a list of stakeholders separated by comma and without spaces;
        `scale`: the scale of the document;
        `issuanceDate`: the date of the document, by typing yyyy or mm/yyyy all the documents with those months and years are matched;
        `type`: the type of the document;
        `language`: the language of the document;
        `pageSize and pageNumber`: useful for pagination, the former states the size of the page, the latter states the number of the page.  
    - request body: none;
    - response body: 
    ``` json
    [
        [
            {
                "id": 1,
                "title": "General Plan",
                "description": "Plan for the entire Kiruna municipality",
                "zoneID": 0,
                "latitude": null,
                "longitude": null,
                "stakeholders": "Public Administration",
                "scale": "1:1000",
                "issuanceDate": "2024",
                "type": "Report",
                "language": "English",
                "pages": "120",
                "connections": 2,
                "attachment": [
                {
                    "name": "General Plan PDF",
                    "path": "/attachments/general_plan.pdf"
                },
                {
                    "name": "General Plan PDF",
                    "path": "/attachments/general_plan.pdf"
                }
                ],
                "resource": [
                {
                    "name": "Kiruna Overview",
                    "path": "/resources/kiruna_overview.pdf"
                },
                {
                    "name": "Kiruna Overview",
                    "path": "/resources/kiruna_overview.pdf"
                }
                ],
                "links": [
                {
                    "documentID": 3,
                    "relationship": "Direct consequence"
                },
                {
                    "documentID": 4,
                    "relationship": "Collateral consequence"
                }
                ]
            },
            {
                "id": 2,
                "title": "Zone 1 Development",
                "description": "Development plan for Zone 1",
                "zoneID": 1,
                "latitude": 67.88,
                "longitude": 20.185,
                "stakeholders": "Urban Planners, Developers",
                "scale": "1:500",
                "issuanceDate": "02/2024",
                "type": "Plan",
                "language": "Swedish",
                "pages": "30",
                "connections": 2,
                "attachment": [
                {
                    "name": "Zone 1 Map",
                    "path": "/attachments/zone1_map.png"
                },
                {
                    "name": "Zone 1 Map",
                    "path": "/attachments/zone1_map.png"
                }
                ],
                "resource": [
                {
                    "name": "Development Guidelines",
                    "path": "/resources/development_guidelines.pdf"
                },
                {
                    "name": "Development Guidelines",
                    "path": "/resources/development_guidelines.pdf"
                }
                ],
                "links": [
                {
                    "documentID": 3,
                    "relationship": "Update"
                },
                {
                    "documentID": 4,
                    "relationship": "Update"
                }
                ]
            },
            {
                "id": 3,
                "title": "Special Project",
                "description": "Independent project in Kiruna",
                "zoneID": null,
                "latitude": 67.86,
                "longitude": 20.2,
                "stakeholders": "Private Companies",
                "scale": "1:100",
                "issuanceDate": "12/02/2024",
                "type": "Project",
                "language": "English",
                "pages": "15",
                "connections": 3,
                "attachment": [
                {
                    "name": "Special Project Proposal",
                    "path": "/attachments/special_project_proposal.docx"
                },
                {
                    "name": "Special Project Proposal",
                    "path": "/attachments/special_project_proposal.docx"
                },
                {
                    "name": "Special Project Proposal",
                    "path": "/attachments/special_project_proposal.docx"
                }
                ],
                "resource": [
                {
                    "name": "Project Budget",
                    "path": "/resources/project_budget.xlsx"
                },
                {
                    "name": "Project Budget",
                    "path": "/resources/project_budget.xlsx"
                },
                {
                    "name": "Project Budget",
                    "path": "/resources/project_budget.xlsx"
                }
                ],
                "links": [
                {
                    "documentID": 1,
                    "relationship": "Collateral consequence"
                },
                {
                    "documentID": 2,
                    "relationship": "Projection"
                },
                {
                    "documentID": 4,
                    "relationship": "Projection"
                }
                ]
            },
            {
                "id": 4,
                "title": "Zone 2 Report",
                "description": "Annual report for Zone 2",
                "zoneID": 2,
                "latitude": 67.86,
                "longitude": 20.21,
                "stakeholders": "Local Government",
                "scale": "1:200",
                "issuanceDate": "11/03/2001",
                "type": "Report",
                "language": "Swedish",
                "pages": "25",
                "connections": 3,
                "attachment": [],
                "resource": [],
                "links": [
                {
                    "documentID": 1,
                    "relationship": "Direct consequence"
                },
                {
                    "documentID": 2,
                    "relationship": "Projection"
                },
                {
                    "documentID": 3,
                    "relationship": "Collateral consequence"
                }
                ]
            }
            ]
    ]
    ```
    - response:
      - It should return status code `200 Ok` on success;
      - It should return status code `500 Internal Server Error` if the database query throws and error.