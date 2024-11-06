import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
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
        <h1>Documents</h1>
        {userInfo.role == "Urban Planner" && (
          <NewDocument updateTable={fetchDocuments} userInfo={userInfo} />
        )}
      </div>
      <div>
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
                <td>
                  {document.document.title ? document.document.title : "-"}
                </td>
                <td>{document.document.type ? document.document.type : "-"}</td>
                <td>
                  {document.document.issuanceDate
                    ? document.document.issuanceDate
                    : "-"}
                </td>
                <td>
                  {document.document.connections
                    ? document.document.connections
                    : "-"}
                </td>
                <td>
                  {document.document.language
                    ? document.document.language
                    : "-"}
                </td>
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
