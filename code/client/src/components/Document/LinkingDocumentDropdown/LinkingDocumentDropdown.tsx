import { Col, Container, Dropdown, Row } from "react-bootstrap";

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
            <Col md={4}>
              <span>{doc.title}</span>
            </Col>
            <Col md={8}>
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
          </Row>
        </Container>
      </div>
    </>
  );
};
