import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import API from "../../API/API";
import { LinkingDocumentsModal } from "./LinkingDocuments/LinkingDocumentsModal";
import NewDocument from "../NewDocument/NewDocument";
interface userProps {
  userInfo: { username: string; role: string };
}
export const DocumentList = ({ userInfo }: userProps) => {
  const [documents, setDocuments] = useState([]);
  const fetchDocuments = async () => {
    API.getDocuments().then((data) => {
      setDocuments(data);
    });
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
                  <LinkingDocumentsModal
                    currentDocument={document}
                    documents={documents}
                    updateTable={fetchDocuments}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};
