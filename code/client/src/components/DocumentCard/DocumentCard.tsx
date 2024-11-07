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
              <div>Title: {cardInfo.document.title} </div>
              <div>Stakeholders: {cardInfo.document.stakeholders}</div>
              <div>Scale: {cardInfo.document.scale}</div>
              <div>Issuance date: {cardInfo.document.issuanceDate}</div>
              <div>Type: {cardInfo.document.type}</div>
              <div>Connections: {cardInfo.document.connections}</div>
              <div>Language: {cardInfo.document.language}</div>
              <div>Pages: {cardInfo.document.pages}</div>
              {cardInfo.document.zoneID ? (
                <div>
                  Zone:{" "}
                  {
                    zones.find(
                      (zone: any) => zone.id === cardInfo.document.zoneID
                    )?.name
                  }
                </div>
              ) : (
                <div>
                  <div>Latitude: {cardInfo.document.latitude}</div>
                  <div>Longitude: {cardInfo.document.longitude} </div>
                </div>
              )}
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
