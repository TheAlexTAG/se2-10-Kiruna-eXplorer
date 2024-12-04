import { Document } from "../Map/MapComponent";
import { Button, Container } from "react-bootstrap";
import API from "../../API/API";
import { Dispatch, SetStateAction } from "react";

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
      <div
        style={{
          position: "absolute",
          zIndex: "100",
          width: "400px",
          left: "20px",
          top: "100px",
        }}
      >
        <Container
          className="main-text"
          style={{
            backgroundColor: "#212428f5",
            borderRadius: "12px",
            padding: "20px",
            position: "relative",
          }}
        >
          <div className="d-flex justify-content-between">
            <img
              src={iconToShow ? iconToShow : "/img/doc.png"}
              style={{
                width: "60px",
                height: "60px",
                background: "#80808075",
                borderRadius: "12px",
                padding: "5px",
              }}
            ></img>

            <Button variant="link" onClick={() => setSelectedDocument(null)}>
              <i className="bi bi-x-lg" style={{ color: "#dc3545" }}></i>
            </Button>
          </div>
          <div className="my-1">
            <h4>Title: {cardInfo.title} </h4>
          </div>
          <div className="my-1">
            <strong>Stakeholders:</strong> {cardInfo.stakeholders}
          </div>
          <div className="my-1">
            <strong>Scale:</strong> {cardInfo.scale}
          </div>
          <div className="my-1">
            <strong>Issuance date: </strong>
            {cardInfo.issuanceDate.toString()}
          </div>
          <div className="my-1">
            <strong>Type: </strong>
            {cardInfo.type}
          </div>
          <div className="my-1">
            <strong>Connections:</strong> {cardInfo.connections}
          </div>
          <div className="my-1">
            <strong>Language:</strong>{" "}
            {cardInfo.language ? cardInfo.language : "-"}
          </div>
          <div className="my-1">
            <strong>Pages:</strong> {cardInfo.pages ? cardInfo.pages : "-"}
          </div>

          <div className="my-1">
            {" "}
            <strong>Description:</strong> {cardInfo.description}
          </div>
          {((cardInfo.attachment && cardInfo.attachment.length > 0) ||
            (cardInfo.resource && cardInfo.resource.length > 0)) && (
            <div>
              <strong>Material:</strong>
            </div>
          )}
          <div>
            {cardInfo.attachment && cardInfo.attachment.length > 0 && (
              <div>
                {cardInfo.attachments &&
                  cardInfo.attachments.map((attachment: any, index: number) => (
                    <div key={index}>
                      <a target="_blank">{attachment.name}</a>
                    </div>
                  ))}
              </div>
            )}
            {cardInfo.resource && (
              <>
                <div>Resources:</div>
                {cardInfo.resource.length > 0 &&
                  cardInfo.resource.map((resource: any, index: number) => (
                    <div key={index}>
                      <div key={index}>
                        <Button
                          variant="link"
                          style={{
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                          }}
                          onClick={() =>
                            API.handleDownloadResource(
                              cardInfo.id,
                              resource.name
                            )
                          }
                        >
                          {resource.name}
                        </Button>
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        </Container>
      </div>
    </>
  );
};
