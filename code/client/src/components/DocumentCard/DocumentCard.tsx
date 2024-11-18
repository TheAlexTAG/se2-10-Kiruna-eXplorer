import { Col, Container, Row } from "react-bootstrap";
import API from "../../API/API";
import { useEffect, useState } from "react";

interface DocumentCardProps {
  cardInfo: any;
}

export const DocumentCard = ({ cardInfo }: DocumentCardProps) => {
  const [zones, setZones] = useState<any>([]);
  const fetchZones = () => {
    API.getZones().then((res) => {
      setZones(res);
    });
  };

  useEffect(() => {
    fetchZones();
  }, []);

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
              <div>Title: {cardInfo.title} </div>
              <div>Stakeholders: {cardInfo.stakeholders}</div>
              <div>Scale: {cardInfo.scale}</div>
              <div>Issuance date: {cardInfo.issuanceDate}</div>
              <div>Type: {cardInfo.type}</div>
              <div>Connections: {cardInfo.connections}</div>
              <div>Language: {cardInfo.language}</div>
              <div>Pages: {cardInfo.pages}</div>
              {cardInfo.zoneID ? (
                <div>
                  Zone:{" "}
                  {zones.find((zone: any) => zone.id === cardInfo.zoneID)?.name}
                </div>
              ) : (
                <div>
                  <div>Latitude: {cardInfo.latitude}</div>
                  <div>Longitude: {cardInfo.longitude} </div>
                </div>
              )}
            </Col>
            <Col md={5} style={{ borderLeft: "1px solid gray" }}>
              Description:
              <div>{cardInfo.description}</div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};
