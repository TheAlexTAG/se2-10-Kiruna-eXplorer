import { useRef, useState } from "react";
import { Button, Modal, Alert } from "react-bootstrap";
import "./OriginalResourcesModal.css";
import API from "../../../API/API";

interface OriginalResourcesModalProps {
  currentDocument: any;
}

export const OriginalResourcesModal = ({
  currentDocument,
}: OriginalResourcesModalProps) => {
  const fileInputRef = useRef<any>(null);
  const [show, setShow] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: any) => {
    const selectedFiles = Array.from(event.target.files);
    const duplicateFiles = selectedFiles.filter((newFile: any) =>
      files.some((existingFile) => existingFile.name === newFile.name)
    );

    if (duplicateFiles.length > 0) {
      setError(
        `The following file(s) already exist: ${duplicateFiles
          .map((file: any) => file.name)
          .join(", ")}`
      );
    } else {
      setError(null);
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    }
  };

  const handleClose = () => {
    setShow(false);
    setError(null);
  };

  const handleShow = () => setShow(true);

  const handleDivClick = () => {
    fileInputRef?.current?.click();
    console.log(fileInputRef?.current);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const submitFiles = () => {
    API.addOriginalResource(currentDocument.id, files);
  };

  return (
    <>
      <div style={{ color: "#2d6efd" }} onClick={handleShow} className="p-2">
        <i className="bi bi-file-earmark-arrow-up-fill"></i> Upload Files
      </div>

      <Modal show={show} onHide={handleClose} className="original-resources">
        <Modal.Header closeButton>
          <Modal.Title>Upload Original Resources</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          <div>
            {files.length > 0 ? (
              <>
                <p>List of the added files:</p>
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      {file.name}{" "}
                      <Button
                        variant="link"
                        onClick={() => handleRemoveFile(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>No files selected.</p>
            )}
          </div>
          <div
            className="upload-button mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <i className="bi bi-plus-lg"></i> Upload new files
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            multiple
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={submitFiles}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};
