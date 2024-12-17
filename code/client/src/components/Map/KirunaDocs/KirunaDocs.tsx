import React from "react";
import { Badge, Button, Col, Container, Modal, Row } from "react-bootstrap";
import { Document, KirunaDocument } from "../MapComponent";
import AgreementIcon from "../../../assets/icons/agreement-icon";
import ConflictIcon from "../../../assets/icons/conflict-icon";
import ConsultationIcon from "../../../assets/icons/consultation-icon";
import MaterialEffectIcon from "../../../assets/icons/material-effect-icon";
import TechnicalIcon from "../../../assets/icons/technical-icon";
import DesignIcon from "../../../assets/icons/design-icon";
import PrescriptiveIcon from "../../../assets/icons/prescriptive-icon";

interface KirunaDocsProps {
  show: boolean;
  onClose: () => void;
  kirunaDocuments: KirunaDocument[] | null;
  handleMoreClick: (doc: Document | KirunaDocument) => void;
}

const KirunaDocs: React.FC<KirunaDocsProps> = ({
  show,
  onClose,
  kirunaDocuments,
  handleMoreClick,
}) => {
  const handleIconClick = (doc: KirunaDocument) => {
    handleMoreClick(doc);
  };

  const getIconByType = (type: string) => {
    const iconComponents: { [key: string]: JSX.Element } = {
      Agreement: <AgreementIcon width={30} height={30} />,
      Conflict: <ConflictIcon width={30} height={30} />,
      Consultation: <ConsultationIcon width={30} height={30} />,
      "Material effect": <MaterialEffectIcon width={30} height={30} />,
      "Technical doc.": <TechnicalIcon width={30} height={30} />,
      "Design doc.": <DesignIcon width={30} height={30} />,
      "Prescriptive doc.": <PrescriptiveIcon width={30} height={30} />,
      default: <PrescriptiveIcon width={30} height={30} />,
    };
    return iconComponents[type] || iconComponents.default;
  };

  const res = getIconByType("Agreement");
  // console.log("res: ", res);
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Kiruna Municipal Documents</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {kirunaDocuments && kirunaDocuments.length > 0 ? (
          <Container>
            {kirunaDocuments.map((doc) => (
              <Row
                key={doc.id}
                className="d-flex justify-content-between align-items-center"
                style={{ marginBottom: "20px" }}
              >
                <Col md={5}>
                  <h5>{doc.title}</h5>
                </Col>
                <Col md={5}>
                  <p className="mb-0 text-muted">Type: {doc.type}</p>
                </Col>
                <Col md={2}>
                  <Badge
                    bg="info"
                    pill
                    onClick={() => handleIconClick(doc)}
                    style={{ cursor: "pointer" }}
                  >
                    {getIconByType(doc.type)}
                  </Badge>
                </Col>
              </Row>
            ))}
          </Container>
        ) : (
          <p className="text-muted">No documents available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default KirunaDocs;
