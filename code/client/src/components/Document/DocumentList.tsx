import { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  Form,
  Row,
  Col,
  Collapse,
  Dropdown,
  DropdownButton,
  Alert,
} from "react-bootstrap";
import API from "../../API/API";
import { LinkingDocumentsModal } from "./LinkingDocuments/LinkingDocumentsModal";
import EditDocumentModal from "./EditDocuments/EditDocumentsModal";
import NewDocument from "../NewDocument/NewDocument";
import "./DocumentList.css";
import "./OriginalResources/OriginalResourcesModal.css";
interface userProps {
  userInfo: { username: string; role: string } | null;
}

export const DocumentList = ({ userInfo }: userProps) => {
  const [documents, setDocuments] = useState([]);
  const [document, setDocument] = useState<any | null>(null);
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
      const filteredData = await API.filterDocuments(
        filters.stakeholders || undefined,
        filters.scale || undefined,
        filters.issuanceDate || undefined,
        filters.type || undefined,
        filters.language || undefined
      );
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

  /////////////
  const handleSelectDiv = (document: any) => {
    setDocument(document);
    setShow(true);
  };
  const fileInputRef = useRef<any>(null);
  const [show, setShow] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: any) => {
    const selectedFiles = Array.from(event.target.files);
    const duplicateFiles = selectedFiles.filter((newFile: any) =>
      files.some((existingFile) => existingFile.name === newFile.name)
    );
    const duplicateFilesFromDoc = document?.resource.filter((resource: any) =>
      selectedFiles.some(
        (newFile: any) =>
          "resources/" + document.id + "-" + newFile.name === resource
      )
    );
    if (duplicateFiles.length > 0) {
      setError(
        `The following file(s) already exist: ${duplicateFiles
          .map((file: any) => file.name)
          .join(", ")}`
      );
    } else if (duplicateFilesFromDoc.length > 0) {
      setError(
        `The following file(s) already exist: ${duplicateFilesFromDoc
          .map((file: any) => file.name)
          .join(", ")}`
      );
    } else if (files.length > 4 || event.target.files.length > 5) {
      setError("You can only upload a maximum of 5 files at a time.");
    } else {
      setError(null);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const submitFiles = () => {
    API.addOriginalResource(document.id, files)
      .then(() => {
        fetchDocuments();
        closeUploadingFile();
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  const closeUploadingFile = () => {
    setFiles([]);
    setError(null);
    setDocument(null);
    setShow(false);
  };

  return (
    <div className="mx-4 document-list">
      {/* Header */}
      <div className="my-4 d-flex justify-content-between align-items-center">
        <h2>Documents</h2>
        {userInfo?.role === "Urban Planner" && (
          <NewDocument
            setSuccessMessage={setSuccessMessage}
            updateTable={fetchDocuments}
            userInfo={userInfo}
          />
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
      {successMessage && (
        <Alert variant="success" dismissible>
          {successMessage}
        </Alert>
      )}
      <div>
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
              {userInfo?.role === "Urban Planner" && <th>Actions</th>}
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
                {userInfo?.role === "Urban Planner" && (
                  <td className="d-flex justify-content-center">
                    <DropdownButton
                      variant="link-black"
                      title={<i className="bi bi-three-dots-vertical"></i>}
                    >
                      <Dropdown.Item>
                        <LinkingDocumentsModal
                          currentDocument={document}
                          documents={documents}
                          updateTable={fetchDocuments}
                        />
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <div
                          className="p-2"
                          onClick={() => handleEditClick(document)}
                          style={{ color: "green" }}
                        >
                          <i className="bi bi-pencil-square"></i> Edit Document
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <div
                          style={{ color: "#2d6efd" }}
                          onClick={() => handleSelectDiv(document)}
                          className="p-2"
                        >
                          <i className="bi bi-file-earmark-arrow-up-fill"></i>{" "}
                          Upload Files
                        </div>
                      </Dropdown.Item>
                    </DropdownButton>
                  </td>
                )}
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

      <div className={`original-resources ${show ? "show" : "hide"}`}>
        <div className="original-resources-header">
          <h4>Upload Original Resources {show ? "show" : "hide"}</h4>
          <Button variant="close" onClick={() => closeUploadingFile()}></Button>
        </div>
        <div className="original-resources-body">
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <div>
            {document && document.resource && document.resource.length > 0 && (
              <>
                <div>
                  <strong>Existing resources:</strong>
                </div>

                {document.resource.map((resource: any, index: number) => {
                  const cleanedResource = resource.replace("resources/", "");
                  return (
                    <div key={index}>
                      <Button
                        variant="link"
                        onClick={() =>
                          API.handleDownloadResource(cleanedResource)
                        }
                      >
                        {cleanedResource}
                      </Button>
                    </div>
                  );
                })}
              </>
            )}

            {files.length > 0 ? (
              <>
                <p>List of the added files:</p>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      {file.name}{" "}
                      <Button
                        variant="link"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No files selected.</p>
            )}
          </div>
          <div
            className="upload-button mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-plus-lg"></i> Upload new files
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            multiple
          />
        </div>
        <div className="original-resources-footer">
          <Button variant="secondary" onClick={closeUploadingFile}>
            Close
          </Button>
          <Button variant="primary" onClick={submitFiles}>
            Save Changes
          </Button>
        </div>
      </div>
      <div
        className={show ? "myBackground" : ""}
        onClick={closeUploadingFile}
      ></div>
    </div>
  );
};
