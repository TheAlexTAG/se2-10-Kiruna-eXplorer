import { useState } from "react";
import { Alert, Button, Dropdown, Modal } from "react-bootstrap";
import "./LinkingDocumentsModal.css";
import API from "../../../API/API";

interface documentsProps {
  documents: any;
  currentDocument: any;
  updateTable: any;
}

export const LinkingDocumentsModal = ({
  documents,
  currentDocument,
  updateTable,
}: documentsProps) => {
  const [show, setShow] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [relationship, setRelationship] = useState("");
  const [error, setError] = useState("");

  const relationshipList = [
    "Direct consequence",
    "Collateral consequence",
    "Projection",
    "Update",
  ];

  const handleClose = () => {
    setRelationship("");
    setSelectedDocument(null);
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleSecletDocument = (id: number) => {
    setSelectedDocument(documents.find((document: any) => document.id === id));
  };

  const handleSubmit = () => {
    API.connectDocuments(currentDocument.id, selectedDocument.id, relationship)
      .then(() => {
        updateTable();
        handleClose();
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <div className="linking-documents">
      <Button variant="primary" onClick={handleShow}>
        Link to a Document
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title> Link to a Document</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxWidth: "1000px" }}>
          <Alert variant="danger" show={error !== ""}>
            {" "}
            {error}
          </Alert>
          <div>
            <div className="d-flex justify-content-around ">
              <div className="mx-4">
                <div>First document:</div>
                <div>Title: {currentDocument.title}</div>
              </div>
              <div className="mx-4">
                Second document:
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    Select Domunets
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {documents
                      .filter((item: any) => item.id !== currentDocument.id)
                      .map((document: any, index: number) => (
                        <Dropdown.Item
                          key={index}
                          onClick={() => handleSecletDocument(document.id)}
                        >
                          {document.title}
                        </Dropdown.Item>
                      ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <div className="d-flex justify-content-around mt-4">
              <div>
                <div>Title: {currentDocument.title}</div>
                <div>Description: {currentDocument.description}</div>
                <div>Stakeholders: {currentDocument.stakeholders}</div>
                <div>Scale: {currentDocument.scale}</div>
                <div>Issuance Date: {currentDocument.issuanceDate}</div>
                <div>Type: {currentDocument.type}</div>
                <div>Language: {currentDocument.language}</div>
                <div>Pages: {currentDocument.pages}</div>
              </div>
              <div>
                <div>
                  Title:{" "}
                  {selectedDocument && selectedDocument.title
                    ? selectedDocument.title
                    : "-"}
                </div>
                <div>
                  Description:{" "}
                  {selectedDocument && selectedDocument.description
                    ? selectedDocument.description
                    : "-"}
                </div>
                <div>
                  Stakeholders:{" "}
                  {selectedDocument && selectedDocument.stakeholders
                    ? selectedDocument.stakeholders
                    : "-"}
                </div>
                <div>
                  Scale:{" "}
                  {selectedDocument && selectedDocument.scale
                    ? selectedDocument.scale
                    : "-"}
                </div>
                <div>
                  Issuance Date:{" "}
                  {selectedDocument && selectedDocument.issuanceDate
                    ? selectedDocument.issuanceDate
                    : "-"}
                </div>
                <div>
                  Type:{" "}
                  {selectedDocument && selectedDocument.type
                    ? selectedDocument.type
                    : "-"}
                </div>
                <div>
                  Language:{" "}
                  {selectedDocument && selectedDocument.language
                    ? selectedDocument.language
                    : "-"}
                </div>
                <div>
                  Pages:{" "}
                  {selectedDocument && selectedDocument.pages
                    ? selectedDocument.pages
                    : "-"}
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-center my-4 align-items-center">
              <div className="mx-4"> Relationship:</div>
              <Dropdown>
                <Dropdown.Toggle variant="success" id="dropdown-basic">
                  Select Relationship
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {relationshipList.map(
                    (relationship: string, index: number) => (
                      <Dropdown.Item
                        key={index}
                        onClick={() => setRelationship(relationship)}
                      >
                        {relationship}
                      </Dropdown.Item>
                    )
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!relationship || selectedDocument == null}
          >
            Link
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
