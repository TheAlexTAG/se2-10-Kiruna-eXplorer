import { Document, KirunaDocument } from "../Map/MapComponent";
import { Button, Container } from "react-bootstrap";
import API from "../../API/API";
import { Dispatch, SetStateAction } from "react";
import AgreementIcon from "../../assets/icons/agreement-icon";
import ConflictIcon from "../../assets/icons/conflict-icon";
import ConsultationIcon from "../../assets/icons/consultation-icon";
import MaterialEffectIcon from "../../assets/icons/material-effect-icon";
import TechnicalIcon from "../../assets/icons/technical-icon";
import DesignIcon from "../../assets/icons/design-icon";
import PrescriptiveIcon from "../../assets/icons/prescriptive-icon";

interface DocumentCardProps {
  cardInfo: any;
  setSelectedDocument: Dispatch<
    SetStateAction<Document | KirunaDocument | null>
  >;
}

export const DocumentCard = ({
  cardInfo,
  setSelectedDocument,
}: DocumentCardProps) => {
  const getIconByType = (type: string) => {
    const iconComponents: { [key: string]: JSX.Element } = {
      Agreement: <AgreementIcon width={60} height={60} />,
      Conflict: <ConflictIcon width={60} height={60} />,
      Consultation: <ConsultationIcon width={60} height={60} />,
      "Material effect": <MaterialEffectIcon width={60} height={60} />,
      "Technical doc.": <TechnicalIcon width={60} height={60} />,
      "Design doc.": <DesignIcon width={60} height={60} />,
      "Prescriptive doc.": <PrescriptiveIcon width={60} height={60} />,
      default: <PrescriptiveIcon width={60} height={60} />,
    };
    return iconComponents[type] || iconComponents.default;
  };
  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: "1400",
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
            // overflowY: "scroll",
            height: "85vh",
          }}
        >
          <div className="d-flex justify-content-between">
            {getIconByType(cardInfo.type)}
            <Button variant="link" onClick={() => setSelectedDocument(null)}>
              <i className="bi bi-x-lg" style={{ color: "#dc3545" }}></i>
            </Button>
          </div>
          <div className="my-1">
            <h4>Title: {cardInfo.title} </h4>
          </div>
          <div style={{ overflowY: "scroll", height: "85%" }}>
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
                    cardInfo.attachments.map(
                      (attachment: any, index: number) => (
                        <div key={index}>
                          <a target="_blank">{attachment.name}</a>
                        </div>
                      )
                    )}
                </div>
              )}
              {cardInfo.resource.length > 0 && (
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
                              textAlign: "left",
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
          </div>
        </Container>
      </div>
    </>
  );
};
