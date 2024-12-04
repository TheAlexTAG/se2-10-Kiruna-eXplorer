import Select, { MultiValue } from "react-select";
import { Col, Container, Form, Row } from "react-bootstrap";
import { useEffect } from "react";

interface LinkingDocumentDropdownProps {
  mainDoc: any;
  doc: any;
  setRelationship: any;
}
type OptionType = {
  value: string;
  label: string;
};

export const LinkingDocumentDropdown = ({
  mainDoc,
  doc,
  setRelationship,
}: LinkingDocumentDropdownProps) => {
  const relationshipList: OptionType[] = [
    { value: "Direct consequence", label: "Direct consequence" },
    { value: "Collateral consequence", label: "Collateral consequence" },
    { value: "Projection", label: "Projection" },
    { value: "Update", label: "Update" },
  ];
  const relationshipsFilter = mainDoc.links
    .filter((item) => item.documentID === doc.id)
    .map((item) => item.relationship);
  const handleSelectedRelationShips = (
    selectedRelationShips: MultiValue<OptionType>
  ) => {
    const valuesString = [...selectedRelationShips].map(
      (option) => option.value
    );
    // .join(", ");
    setRelationship(valuesString, doc.id);
  };
  return (
    <>
      <div>
        <Container>
          <Row>
            <Col md={6}>
              <span className="main-text">{doc.title}</span>
            </Col>
            <Col md={5} className="d-flex align-items-center">
              <Form>
                <Form.Group>
                  <Select
                    options={
                      relationshipsFilter.length > 0
                        ? relationshipList.filter((item) =>
                            relationshipsFilter.includes(item.value)
                          )
                        : relationshipList
                    }
                    isMulti={true}
                    placeholder="Select Relationships"
                    className="custom-input"
                    onChange={handleSelectedRelationShips}
                  />
                  <input
                    type="hidden"
                    name="stakeholders"
                    // value={stakeholders}
                  />
                </Form.Group>
              </Form>
            </Col>
            {/* <Col md={1} className="d-flex align-items-center">
              <Button variant="outline-danger">
                <i className="bi bi-x-lg"></i>
              </Button>
            </Col> */}
          </Row>
        </Container>
      </div>
    </>
  );
};
