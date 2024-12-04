import { Col, Container, Row } from "react-bootstrap";
import { Dispatch, SetStateAction } from "react";
import { IoClose } from "react-icons/io5";
import { Document } from "../Map/MapComponent";

interface DocumentCardProps {
  cardInfo: any;
  iconToShow: string | undefined;
  setSelectedDocument: Dispatch<SetStateAction<Document | null>>;
}

export const DocumentCard = ({
  cardInfo,
  iconToShow,
  setSelectedDocument,
}: DocumentCardProps) => {
  return (
    <>
      <div style={{ position: "relative", zIndex: "100" }}>
        <Container
          style={{
            backgroundColor: "#fffffff2",
            borderRadius: "12px",
            padding: "20px",
            position: "relative",
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
            </Col>
            <Col md={5} style={{ borderLeft: "1px solid gray" }}>
              Description:
              <div>{cardInfo.description}</div>
              <IoClose
                size={30}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "7px",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedDocument(null)}
              />
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};
