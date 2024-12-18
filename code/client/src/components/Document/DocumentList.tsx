import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  Form,
  Col,
  Collapse,
  Dropdown,
  DropdownButton,
  Alert,
  InputGroup,
  Card,
  Pagination,
} from "react-bootstrap";
import API from "../../API/API";
import { LinkingDocumentsModal } from "./LinkingDocuments/LinkingDocumentsModal";
import EditDocumentModal from "./EditDocuments/EditDocumentsModal";
import NewDocument from "../NewDocument/NewDocument";
import "./DocumentList.css";
import "./OriginalResources/OriginalResourcesModal.css";
import { useNavigate } from "react-router-dom";
interface UserProps {
  userInfo: { username: string; role: string } | null;
}

interface FilterProps {
  documents: any;
  fetchDocuments: any;
  setFilteredDocuments: Dispatch<SetStateAction<any>>;
  filterVisible: boolean;
  setFilterVisible: Dispatch<SetStateAction<boolean>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  setTotalItems: Dispatch<SetStateAction<number>>;
  setFilters: Dispatch<
    SetStateAction<{
      stakeholders: string;
      scale: string;
      issuanceDate: string;
      type: string;
      language: string;
    }>
  >;
  filters: {
    stakeholders: string;
    scale: string;
    issuanceDate: string;
    type: string;
    language: string;
  };
}

export const DocumentList = ({ userInfo }: UserProps) => {
  const navigate = useNavigate();
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage]);
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  const fetchDocuments = async (pageNumber: number) => {
    API.getDocumentsWithPagination(
      pageNumber,
      10,
      filters.stakeholders || undefined,
      filters.scale || undefined,
      filters.issuanceDate || undefined,
      filters.type || undefined,
      filters.language || undefined
    ).then((data) => {
      setDocuments(data.documents);
      setFilteredDocuments(data.documents);
      setTotalItems(data.totalItems);
    });
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
    fetchDocuments(currentPage);
  }, []);

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
      selectedFiles.some((newFile: any) => newFile.name === resource.name)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const submitFiles = () => {
    API.addOriginalResource(document.id, files)
      .then(() => {
        fetchDocuments(currentPage);
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
    <div className="mx-4 document-list" style={{ paddingBottom: "20px" }}>
      {/* Header */}
      <div className="my-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="main-text">Documents</h2>
        </div>
        <div className="d-flex align-items-center">
          {/* Search Bar */}
          <div>
            <InputGroup className="search-bar" data-bs-theme="dark">
              <Form.Control
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <InputGroup.Text
                style={{ background: "none", borderLeft: "none" }}
              >
                <i className="bi bi-search" style={{ color: "#085FB2" }}></i>
              </InputGroup.Text>
            </InputGroup>
          </div>
          {/* Button to toggle filter visibility */}
          <Button variant="link" onClick={toggleFilterVisibility}>
            {filterVisible ? (
              <i className="bi bi-x-lg fs-4" style={{ color: "#dc3545" }}></i>
            ) : (
              <i className="bi bi-funnel fs-4" style={{ color: "#085FB2" }}></i>
            )}
          </Button>
        </div>
      </div>
      {userInfo?.role === "Urban Planner" && (
        <NewDocument
          setSuccessMessage={setSuccessMessage}
          updateTable={fetchDocuments}
          userInfo={userInfo}
        />
      )}

      {/* Filters Form */}
      <FilterDocs
        documents={documents}
        fetchDocuments={fetchDocuments}
        setFilteredDocuments={setFilteredDocuments}
        filterVisible={filterVisible}
        setFilterVisible={setFilterVisible}
        setCurrentPage={setCurrentPage}
        setTotalItems={setTotalItems}
        setFilters={setFilters}
        filters={filters}
      />
      {successMessage && (
        <Alert variant="success" dismissible>
          {successMessage}
        </Alert>
      )}
      <div>
        <Table
          striped
          bordered
          hover
          className="text-center"
          data-bs-theme="dark"
          style={{ color: "whitesmoke" }}
        >
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
                  <td>
                    <DropdownButton
                      variant="link-black"
                      title={<i className="bi bi-three-dots-vertical"></i>}
                    >
                      <Dropdown.Item>
                        <LinkingDocumentsModal
                          currentDocument={document}
                          updateTable={fetchDocuments}
                          setSuccessMessage={setSuccessMessage}
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
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <button
                          style={{ color: "#2d6efd" }}
                          className="p-2 reset-button"
                          onClick={() => {
                            navigate("/diagram", {
                              state: { selectedDocument: document },
                            });
                          }}
                        >
                          <i className="bi bi-diagram-3"></i> Open in Diagram
                        </button>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item>
                        <button
                          style={{ color: "#2d6efd" }}
                          className="p-2 reset-button"
                          onClick={() => {
                            navigate("/map", {
                              state: { selectedDocument: document },
                            });
                          }}
                        >
                          <i className="bi bi-geo-alt"></i> Open in Map
                        </button>
                      </Dropdown.Item>
                    </DropdownButton>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-center ">
          <Pagination data-bs-theme="dark">
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            />
            {paginationItems}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </Pagination>
        </div>
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
          <h4 className="main-text">
            Upload Original Resources {show ? "show" : "hide"}
          </h4>
          <Button variant="link" onClick={() => closeUploadingFile()}>
            <i className="bi bi-x-lg fs-5" style={{ color: "red" }}></i>
          </Button>
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
                  <strong className="main-text">Existing resources:</strong>
                </div>

                {document.resource.map((resource: any, index: number) => {
                  return (
                    <div key={index}>
                      <Button
                        variant="link"
                        onClick={() =>
                          API.handleDownloadResource(document.id, resource.name)
                        }
                      >
                        {resource.name}
                      </Button>
                    </div>
                  );
                })}
              </>
            )}

            {files.length > 0 ? (
              <>
                <p className="main-text">List of the added files:</p>
                <ul>
                  {files.map((file, index) => (
                    <li key={index} className="main-text">
                      {file.name}{" "}
                      <Button
                        variant="link"
                        onClick={() => handleRemoveFile(index)}
                        style={{ color: "#dc3545" }}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="main-text">No files selected.</p>
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

export const FilterDocs: React.FC<FilterProps> = ({
  documents,
  fetchDocuments,
  setFilteredDocuments,
  filterVisible,
  setFilterVisible,
  setCurrentPage,
  setTotalItems,
  setFilters,
  filters,
}) => {
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

  const applyFilters = async () => {
    try {
      const filteredData = await API.getDocumentsWithPagination(
        1,
        10,
        filters.stakeholders || undefined,
        filters.scale || undefined,
        filters.issuanceDate || undefined,
        filters.type || undefined,
        filters.language || undefined
      );
      setFilteredDocuments(filteredData.documents);
      setCurrentPage(1);
      setTotalItems(filteredData.totalItems);
      setFilterVisible(false);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };
  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleResetFilters = async () => {
    try {
      setFilters({
        stakeholders: "",
        scale: "",
        issuanceDate: "",
        type: "",
        language: "",
      });
      const filteredData = await API.getDocumentsWithPagination(
        1,
        10,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
      setFilteredDocuments(filteredData.documents);
      setCurrentPage(1);
      setTotalItems(filteredData.totalItems);
      setFilterVisible(false);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };

  return (
    <Collapse in={filterVisible}>
      <Card
        data-bs-theme="dark"
        className="main-text"
        style={{
          width: "310px",
          position: "absolute",
          right: "32px",
          zIndex: "999",
          top: "140px",
        }}
      >
        <h3>Filters</h3>

        <Form className="mb-3 filter-card" data-bs-theme="dark">
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
            <Form.Select
              name="scale"
              value={filters.scale}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange(event)
              }
            >
              <option value="">Select Scale</option>
              <option value="Blueprints/effects">Blueprints/effects</option>
              <option value="1:1,000">1:1,000</option>
              <option value="1:5,000">1:5,000</option>
              <option value="1:10,000">1:10,000</option>
              <option value="1:100,000">1:100,000</option>
              <option value="Concept">Concept</option>
              <option value="Text">Text</option>
            </Form.Select>
          </Form.Group>

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

          <div className="d-flex justify-content-between mt-3">
            <Button variant="primary" onClick={applyFilters}>
              Apply
            </Button>
            <Button variant="outline-danger" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </Form>
      </Card>
    </Collapse>
  );
};
