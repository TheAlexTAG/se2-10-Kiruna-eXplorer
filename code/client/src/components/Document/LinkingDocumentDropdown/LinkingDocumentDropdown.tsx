import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";

interface LinkingDocumentDropdownProps {
  doc: any;
  setRelationship: any;
}

export const LinkingDocumentDropdown = ({
  doc,
  setRelationship,
}: LinkingDocumentDropdownProps) => {
  const relationshipList = [
    "Direct consequence",
    "Collateral consequence",
    "Projection",
    "Update",
  ];
  return (
    <>
      <div>
        <Container>
          <Row>
            <Col md={6}>
              <span className="main-text">{doc.title}</span>
            </Col>
            <Col md={5} className="d-flex align-items-center">
              <Dropdown>
                <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                  {doc.relationship || "Relationship"}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {relationshipList.map((item, index) => (
                    <Dropdown.Item
                      key={index}
                      onClick={() => setRelationship(item, doc.id)}
                    >
                      {item}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Col>
            <Col md={1} className="d-flex align-items-center">
              <Button variant="outline-danger">
                <i className="bi bi-x-lg"></i>
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};
