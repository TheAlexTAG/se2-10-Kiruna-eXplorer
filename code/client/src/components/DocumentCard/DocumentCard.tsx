import { Col, Container, Row } from "react-bootstrap";
import API from "../../API/API";
import { useEffect, useState } from "react";

interface DocumentCardProps {
  cardInfo: any;
  iconToShow: string | undefined;
}

export const DocumentCard = ({ cardInfo, iconToShow }: DocumentCardProps) => {
  const [zones, setZones] = useState<any>([]);
  const fetchZones = () => {
    API.getZones().then((res) => {
      setZones(res);
    });
  };

  useEffect(() => {
    fetchZones();
  }, []);

  console.log(cardInfo);

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
              <img
                src={iconToShow ? iconToShow : "/img/doc.png"}
                style={{ width: "60px", height: "60px" }}
              ></img>
            </Col>
            <Col md={5} style={{ borderLeft: "1px solid gray" }}>
              <div>Title: {cardInfo.title} </div>
              <div>Stakeholders: {cardInfo.stakeholders}</div>
              <div>Scale: {cardInfo.scale}</div>
              <div>Issuance date: {cardInfo.issuanceDate}</div>
              <div>Type: {cardInfo.type}</div>
              <div>Connections: {cardInfo.connections}</div>
              <div>Language: {cardInfo.language ? cardInfo.language : "-"}</div>
              <div>Pages: {cardInfo.pages ? cardInfo.pages : "-"}</div>
              {/*Removed zone since no requirement about it(actually they told us they dont't want it somehow) */}
              {/*cardInfo.zoneID ? (
                <div>Zone: {cardInfo.zoneID}</div>
              ) : (
                <div>
                  <div>Latitude: {cardInfo.latitude}</div>
                  <div>Longitude: {cardInfo.longitude} </div>
                </div>
              )*/}
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
