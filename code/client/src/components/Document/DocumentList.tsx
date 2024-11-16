import { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import API from "../../API/API";
import { LinkingDocumentsModal } from "./LinkingDocuments/LinkingDocumentsModal";
import EditDocumentModal from "./EditDocuments/EditDocumentsModal";
import NewDocument from "../NewDocument/NewDocument";
import { FaEdit } from "react-icons/fa";

interface userProps {
  userInfo: { username: string; role: string };
}

export const DocumentList = ({ userInfo }: userProps) => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDocuments = async () => {
    API.getDocuments().then((data) => {
      setDocuments(data);
      setFilteredDocuments(data);
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = documents.filter((document: any) =>
      document.title?.toLowerCase().includes(value)
    );
    setFilteredDocuments(filtered);
  };

  const handleEditClick = (document: any) => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="mx-4">
      <div className="my-4 d-flex justify-content-between align-items-center">
        <h2>Documents</h2>
        {userInfo.role === "Urban Planner" && (
          <NewDocument updateTable={fetchDocuments} userInfo={userInfo} />
        )}
      </div>

      {/* Search Bar */}
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </Form.Group>

      <div style={{ overflow: "auto" }}>
        <Table striped bordered hover className="text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Type</th>
              <th>Issue Date</th>
              <th>Connections</th>
              <th>Language</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((document: any, index: number) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{document.title ? document.title : "-"}</td>
                <td>{document.type ? document.type : "-"}</td>
                <td>{document.issuanceDate ? document.issuanceDate : "-"}</td>
                <td>{document.connections ? document.connections : "-"}</td>
                <td>{document.language ? document.language : "-"}</td>
                <td className="d-flex justify-content-center">
                  {/* Link to a Document Button */}
                  <LinkingDocumentsModal
                    currentDocument={document}
                    documents={documents}
                    updateTable={fetchDocuments}
                  />

                  {/* Edit Icon */}
                  <Button
                    variant="success"
                    className="ml-2 d-flex align-items-center justify-content-center"
                    onClick={() => handleEditClick(document)}
                  >
                    <FaEdit color="white" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {selectedDocument && (
        <EditDocumentModal
          document={selectedDocument}
          updateTable={fetchDocuments}
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};
