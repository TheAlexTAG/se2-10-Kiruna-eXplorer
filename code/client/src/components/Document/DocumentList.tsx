import { useEffect, useState } from "react";
import { Table, Button, Form, Row, Col, Collapse } from "react-bootstrap";
import API from "../../API/API";
import { LinkingDocumentsModal } from "./LinkingDocuments/LinkingDocumentsModal";
import EditDocumentModal from "./EditDocuments/EditDocumentsModal";
import NewDocument from "../NewDocument/NewDocument";
interface userProps {
  userInfo: { username: string; role: string };
}

export const DocumentList = ({ userInfo }: userProps) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisible, setFilterVisible] = useState(false); //state fot show/hide filters form
  const [filters, setFilters] = useState({
    stakeholders: "",
    scale: "",
    issuanceDate: "",
    type: "",
    language: "",
  });

  const stakeholderOptions: string[] = [
    "LKAB",
    "Municipalty",
    "Regional authority",
    "Architecture firms",
    "Citizens",
    "Kiruna kommun",
    "Others",
  ];

  const typeOptions: string[] = [
    "Design doc.",
    "Informative doc.",
    "Prescriptive doc.",
    "Technical doc.",
    "Agreement",
    "Conflict",
    "Consultation",
    "Material effect",
  ];

  const fetchDocuments = async () => {
    API.getDocuments().then((data) => {
      setDocuments(data);
      setFilteredDocuments(data);
    });
  };

  const applyFilters = async () => {
    try {
      const filteredData = documents.filter((document: any) => {
        return (
          (filters.stakeholders
            ? document.stakeholders
                ?.toLowerCase()
                .includes(filters.stakeholders.toLowerCase())
            : true) &&
          (filters.scale
            ? document.scale
                ?.toLowerCase()
                .includes(filters.scale.toLowerCase())
            : true) &&
          (filters.issuanceDate
            ? document.issuanceDate?.includes(filters.issuanceDate)
            : true) &&
          (filters.type
            ? document.type?.toLowerCase().includes(filters.type.toLowerCase())
            : true) &&
          (filters.language
            ? document.language
                ?.toLowerCase()
                .includes(filters.language.toLowerCase())
            : true)
        );
      });

      setFilteredDocuments(filteredData);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = documents.filter((document: any) =>
      document.title?.toLowerCase().includes(value)
    );
    setFilteredDocuments(filtered);
  };

  const handleEditClick = (document: any) => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      stakeholders: "",
      scale: "",
      issuanceDate: "",
      type: "",
      language: "",
    });
    setFilteredDocuments(documents);
  };

  // Function for show/hide filters form
  const toggleFilterVisibility = () => {
    setFilterVisible(!filterVisible);
  };

  return (
    <div className="mx-4">
      {/* Header */}
      <div className="my-4 d-flex justify-content-between align-items-center">
        <h2>Documents</h2>
        {userInfo.role === "Urban Planner" && (
          <NewDocument updateTable={fetchDocuments} userInfo={userInfo} />
        )}
      </div>

      {/* Search Bar */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </Form.Group>

      {/* Button to toggle filter visibility */}
      <Button
        variant={filterVisible ? "danger" : "primary"}
        onClick={toggleFilterVisibility}
        className="mb-3"
      >
        {filterVisible ? "Hide Filters" : "Show Filters"}
      </Button>

      {/* Filters Form */}
      <Collapse in={filterVisible}>
        <div>
          <Form className="mb-3">
            <Row>
              <Form.Group as={Col} controlId="filterStakeholders">
                <Form.Label>Stakeholders</Form.Label>
                <Form.Select
                  name="stakeholders"
                  value={filters.stakeholders}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    handleFilterChange(event)
                  }
                >
                  <option value="">Select Stakeholder</option>
                  {stakeholderOptions.map((stakeholder) => (
                    <option key={stakeholder} value={stakeholder}>
                      {stakeholder}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="filterScale">
                <Form.Label>Scale</Form.Label>
                <Form.Control
                  type="text"
                  name="scale"
                  value={filters.scale}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange(event)
                  }
                />
              </Form.Group>
            </Row>
            <Row>
              <Form.Group as={Col} controlId="filterIssuanceDate">
                <Form.Label>Issuance Date</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="DD/MM/YYYY"
                  name="issuanceDate"
                  value={filters.issuanceDate}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange(event)
                  }
                />
              </Form.Group>
              <Form.Group as={Col} controlId="filterType">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    handleFilterChange(event)
                  }
                >
                  <option value="">Select Type</option>
                  {typeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} controlId="filterLanguage">
                <Form.Label>Language</Form.Label>
                <Form.Select
                  name="language"
                  value={filters.language}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    handleFilterChange(event)
                  }
                >
                  <option value="">Select Language</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Swedish">Swedish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Italian">Italian</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Russian">Russian</option>
                  <option value="Arabic">Arabic</option>
                </Form.Select>
              </Form.Group>
            </Row>
            <div className="d-flex justify-content-between">
              <Button variant="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="secondary" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </div>
          </Form>
        </div>
      </Collapse>

      {/* Documents Table */}
      <div style={{ overflow: "auto" }}>
        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Stakeholders</th>
              <th>Scale</th>
              <th>Type</th>
              <th>Issue Date</th>
              <th>Connections</th>
              <th>Language</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((document: any, index: number) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{document.title ? document.title : "-"}</td>
                <td>{document.stakeholders ? document.stakeholders : "-"}</td>
                <td>{document.scale ? document.scale : "-"}</td>
                <td>{document.type ? document.type : "-"}</td>
                <td>{document.issuanceDate ? document.issuanceDate : "-"}</td>
                <td>{document.connections ? document.connections : "-"}</td>
                <td>{document.language ? document.language : "-"}</td>
                <td className="d-flex justify-content-center">
                  <LinkingDocumentsModal
                    currentDocument={document}
                    documents={documents}
                    updateTable={fetchDocuments}
                  />
                  <Button
                    variant="outline-success"
                    className="ml-2 d-flex align-items-center justify-content-center"
                    onClick={() => handleEditClick(document)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {selectedDocument && (
        <EditDocumentModal
          document={selectedDocument}
          updateTable={fetchDocuments}
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};
