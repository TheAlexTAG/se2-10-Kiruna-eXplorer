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
import { useLocation, useNavigate } from "react-router-dom";

interface DocumentCardProps {
  cardInfo: any;
  setSelectedDocument: Dispatch<
    SetStateAction<Document | KirunaDocument | null>
  >;
  handleMoreClick: any;
  inDiagram: boolean;
  setMapZoom?: Dispatch<SetStateAction<number>>;
  setMapCenter?: Dispatch<SetStateAction<[number, number]>>;
}

export const DocumentCard = ({
  cardInfo,
  setSelectedDocument,
  handleMoreClick,
  inDiagram,
  setMapZoom,
  setMapCenter,
}: DocumentCardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const handleChangeCardInfo = (documentID: number) => {
    API.getDocument(documentID)
      .then((response) => {
        handleMoreClick(response);
        console.log("response is ", response);
        if (response.latitude && response.longitude) {
          if (setMapZoom) setMapZoom(15);
          if (setMapCenter)
            setMapCenter([response.latitude, response.longitude]);
        } else {
          console.warn("Document does not have coordinates");
        }
      })
      .catch((err) => {
        console.error("Error fetching document: ", err);
      });
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: "1400",
          width: "400px",
          left: inDiagram ? "20px" : "60px",
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
            overflowY: "auto",
            height: "80vh",
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
          <div style={{}}>
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
            {cardInfo.links && cardInfo.links.length > 0 && (
              <div>
                <div>
                  <strong>Links:</strong>
                </div>
                <div>
                  {cardInfo.links.map((link: any, index: number) => (
                    <div
                      key={index}
                      className="my-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleChangeCardInfo(link.documentID)}
                    >
                      <i
                        className="bi bi-link-45deg mx-1"
                        style={{ color: "#5d5dff" }}
                      ></i>
                      {link.title}({link.relationship})
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <div className="d-flex justify-content-end mt-3">
              {location.pathname !== "/diagram" ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    navigate("/diagram", {
                      state: { selectedDocument: cardInfo },
                    });
                  }}
                >
                  Open in Diagram
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    const serializableCardInfo = JSON.parse(
                      JSON.stringify(cardInfo)
                    );

                    navigate("/map", {
                      state: {
                        selectedDocument: {
                          ...serializableCardInfo,
                          latitude: cardInfo.latitude,
                          longitude: cardInfo.longitude,
                        },
                      },
                    });
                  }}
                >
                  Open in Map
                </Button>
              )}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
