import { Col, Container, Row } from "react-bootstrap";

interface DocumentCardProps {
  cardInfo: any;
}

export const DocumentCard = ({ cardInfo }: DocumentCardProps) => {
  return (
    <>
      <div style={{ position: "relative", zIndex: "100" }}>
        <Container
          style={{
            backgroundColor: "#fffffff2",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <Row>
            <Col md={2} className="d-flex justify-content-center">
              <i className="bi bi-building" style={{ fontSize: "60px" }}></i>
            </Col>
            <Col md={5} style={{ borderLeft: "1px solid gray" }}>
              <div>Title: {cardInfo.document.title} </div>
              <div>Stakeholders: {cardInfo.document.stakeholders}</div>
              <div>Scale: {cardInfo.document.scale}</div>
              <div>Issuance date: {cardInfo.document.issuanceDate}</div>
              <div>Type: {cardInfo.document.type}</div>
              <div>Connections: {cardInfo.document.connections}</div>
              <div>Language: {cardInfo.document.language}</div>
              <div>Pages: {cardInfo.document.pages}</div>
            </Col>
            <Col md={5} style={{ borderLeft: "1px solid gray" }}>
              Description:
              <div>{cardInfo.document.description}</div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};
