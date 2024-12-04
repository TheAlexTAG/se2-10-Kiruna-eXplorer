import React from "react";
import { Button, Modal } from "react-bootstrap";
import { KirunaDocument } from "../MapComponent";

interface KirunaDocsProps {
  show: boolean;
  onClose: () => void;
  kirunaDocuments: KirunaDocument[] | null;
}

const KirunaDocs: React.FC<KirunaDocsProps> = ({
  show,
  onClose,
  kirunaDocuments,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Kiruna Municipal Documents</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {kirunaDocuments && kirunaDocuments.length > 0 ? (
          <ul>
            {kirunaDocuments.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.title}</strong> - Type: {doc.type}
              </li>
            ))}
          </ul>
        ) : (
          <p>No documents available.</p>
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
