/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  Accordion,
  Alert,
  Button,
  Col,
  Container,
  Modal,
  Row,
} from "react-bootstrap";
import "./LinkingDocumentsModal.css";
import API from "../../../API/API";
import { LinkingDocumentDropdown } from "../LinkingDocumentDropdown/LinkingDocumentDropdown";

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
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [selectedItems, setSelectedItems] = useState<any>([]);

  const handleClose = () => {
    setShow(false);
    setTab(0);
    setSelectedItems([]);
  };
  const handleShow = () => setShow(true);

  const handleSelect = (value: any) => {
    if (selectedItems.some((item: any) => item.id === value.id)) {
      setSelectedItems(
        selectedItems.filter((item: any) => item.id !== value.id)
      );
    } else {
      setSelectedItems([...selectedItems, value]);
    }
  };
  const handleRelationship = (relationship: string[], docId: number) => {
    setSelectedItems((prev: any) =>
      prev.map((item: any) =>
        item.id === docId ? { ...item, relationship } : item
      )
    );
  };
  const handleSubmit = () => {
    const items = selectedItems.map((item: any) => {
      return { id: item.id, relationship: item.relationship };
    });
    if (
      items.length === 0 ||
      items.some(
        (item: any) => item.relationship == null || item.relationship == ""
      )
    ) {
      setError("Please select a relationship for each document");
    } else {
      API.connectDocuments(currentDocument.id, items)
        .then(() => {
          updateTable();
          handleClose();
        })
        .catch((err) => {
          setError(err.message);
        });
    }
  };

  return (
    <div className="linking-documents">
      <div onClick={handleShow} className=" p-2">
        <i className="bi bi-link-45deg" style={{ fontSize: "20px" }}></i> Link
        to Documents
      </div>
      <Modal show={show} onHide={handleClose} data-bs-theme="dark" fullscreen>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex">
            <div style={{ height: "45px", width: "45px" }} className="mx-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path
                  fill="#085fb2"
                  d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 128-168 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l168 0 0 112c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zM384 336l0-48 110.1 0-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39L384 336zm0-208l-128 0L256 0 384 128z"
                />
              </svg>
            </div>
            <div className="d-flex alig-items-center pt-2 main-text">
              Link to a Document
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger" show={error !== ""}>
            {error}
          </Alert>
          {tab == 0 ? (
            <div>
              <div>
                <Container>
                  <Row>
                    <Col md={2} className="main-text">
                      {currentDocument.title}
                    </Col>
                    {/* <Col md={{ span: 2, offset: 8 }}>
                      <InputGroup className="mb-3">
                        <Form.Control
                          className="form-control"
                          style={{ borderRight: "none" }}
                          placeholder="Search..."
                        />
                        <InputGroup.Text
                          style={{ background: "none", borderLeft: "none" }}
                        >
                          <i
                            className="bi bi-search"
                            style={{ color: "#085fb2" }}
                          ></i>
                        </InputGroup.Text>
                      </InputGroup>
                    </Col> */}
                  </Row>
                  <Row>
                    <Col md={2}>
                      {" "}
                      <svg width="100%" height="100%">
                        <line
                          x1="10%"
                          y1="0"
                          x2="10%"
                          y2="50%"
                          stroke="#085fb2"
                          strokeWidth="1"
                        />
                        <line
                          x1="10%"
                          y1="50%"
                          x2="90%"
                          y2="50%"
                          stroke="#085fb2"
                          strokeWidth="1"
                        />
                      </svg>
                    </Col>
                    <Col md={10}>
                      <div className="h-100">
                        <Accordion defaultActiveKey="0">
                          {documents
                            .filter(
                              (item: any) => item.id !== currentDocument.id
                            )
                            .map((option: any) => (
                              <Accordion.Item
                                eventKey={option.id}
                                key={option.id}
                              >
                                <Accordion.Header>
                                  <i
                                    className={
                                      selectedItems.some(
                                        (item: any) => item.id === option.id
                                      )
                                        ? "bi bi-check2-square  mx-2"
                                        : "bi bi-square mx-2"
                                    }
                                    style={
                                      selectedItems.some(
                                        (item: any) => item.id === option.id
                                      )
                                        ? { color: "#085fb2" }
                                        : { color: "whitesmoke" }
                                    }
                                    onClick={() => handleSelect(option)}
                                  ></i>{" "}
                                  {option.title}
                                </Accordion.Header>
                                <Accordion.Body>
                                  {option.description}
                                </Accordion.Body>
                              </Accordion.Item>
                            ))}
                        </Accordion>
                      </div>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
          ) : (
            <div className="h-100 d-flex">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "20px",
                }}
              >
                <div className="main-text">{currentDocument.title}</div>
                <svg
                  width="200"
                  height={selectedItems.length * 100}
                  style={{ overflow: "visible" }}
                >
                  {selectedItems.map((_: unknown, index: any) => {
                    const yPosition = 50 + index * 100;
                    const halfHeight = (selectedItems.length * 100) / 2;
                    return (
                      <path
                        key={index}
                        d={`M 10 ${halfHeight} Q 50 ${yPosition}, 100 ${yPosition} T 200 ${yPosition}`}
                        stroke="#085fb2"
                        strokeWidth="1"
                        fill="none"
                      />
                    );
                  })}
                </svg>
                <div style={{ paddingLeft: "20px", marginTop: "75px" }}>
                  {selectedItems.map((doc: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        height: "100px",
                      }}
                    >
                      <LinkingDocumentDropdown
                        doc={doc}
                        setRelationship={handleRelationship}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {tab == 0 ? (
            <Button
              variant="primary"
              onClick={() => setTab(1)}
              disabled={selectedItems.length === 0}
            >
              Next
            </Button>
          ) : (
            <div className="d-flex justify-content-between w-100">
              <Button variant="outline-danger" onClick={() => setTab(0)}>
                back
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};
