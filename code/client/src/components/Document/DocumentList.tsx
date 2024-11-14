import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import API from "../../API/API";
import { LinkingDocumentsModal } from "./LinkingDocuments/LinkingDocumentsModal";
import  EditDocumentModal  from "./EditDocuments/EditDocumentsModal"; 
import NewDocument from "../NewDocument/NewDocument";

interface userProps {
  userInfo: { username: string; role: string };
}

export const DocumentList = ({ userInfo }: userProps) => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDocuments = async () => {
    API.getDocuments().then((data) => {
      setDocuments(data);
    });
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
        {userInfo.role == "Urban Planner" && (
          <NewDocument updateTable={fetchDocuments} userInfo={userInfo} />
        )}
      </div>
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
            {documents.map((document: any, index: number) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{document.title ? document.title : "-"}</td>
                <td>{document.type ? document.type : "-"}</td>
                <td>{document.issuanceDate ? document.issuanceDate : "-"}</td>
                <td>{document.connections ? document.connections : "-"}</td>
                <td>{document.language ? document.language : "-"}</td>
                <td>
                  {/* Link to a Document Button */}
                  <LinkingDocumentsModal
                    currentDocument={document}
                    documents={documents}
                    updateTable={fetchDocuments}
                  />
                  
                  
                  {/* Edit Button */}
                  <Button
                    variant="success"  
                    size="sm"
                    className="ml-2"  
                    onClick={() => handleEditClick(document)}
                  >
                    Edit
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
