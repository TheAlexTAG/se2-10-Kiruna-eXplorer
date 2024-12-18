import { CoordinatesOutOfBoundsError } from "../errors/general";

const SERVER_URL = "http://localhost:3001/api";

const login = async (username: string, password: string) => {
  const response = await fetch(`${SERVER_URL}/sessions`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return await response.json();
};

const logout = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return response;
};

const currentUser = async () => {
  const response = await fetch(`${SERVER_URL}/sessions/current`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Sessions failed");
  }

  return await response.json();
};

const createDocumentNode = async (documentData: any) => {
  console.log(documentData);
  try {
    const response = await fetch(`${SERVER_URL}/document`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(documentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating document:", errorData);
      throw new Error(errorData.message || "Document creation failed");
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    if (error.message === "Coordinates out of bound") {
      throw new CoordinatesOutOfBoundsError();
    } else {
      throw new Error("An error occurred while creating the document");
    }
  }
};

const getZones = async () => {
  const response = await fetch(`${SERVER_URL}/zones`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error getting zones:", errorData);
    throw new Error(errorData.message || "Failed to get zones");
  }
  const data = await response.json();
  console.log("my datazones api is ", data);

  return data;
};

const getDocuments = async () => {
  const response = await fetch(`${SERVER_URL}/documents`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error getting documents:", errorData);
    throw new Error(errorData.message || "Failed to get documents");
  }

  return await response.json();
};

const connectDocuments = async (
  firstDoc: number,
  secondDoc: { id: number; relationship: string }[]
) => {
  const response = await fetch(`${SERVER_URL}/link`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstDoc, secondDoc }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error connecting documents:", errorData);
    throw new Error(errorData.error || "Failed to connect documents");
  }

  return await response.json();
};

const updateGeoreference = async (
  documentID: number,
  zoneID: number | null,
  longitude: number | null,
  latitude: number | null
) => {
  console.log(documentID, zoneID, longitude, latitude);
  const response = await fetch(`${SERVER_URL}/document/${documentID}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ zoneID, longitude, latitude }),
  });

  if (!response.ok) {
    console.log("response is ", response);
    const errorData = await response.json();
    console.error("Error updating georeference:", errorData);
    throw new Error(errorData.error || "Failed to update georeference");
  }

  if (response.status === 200) {
    return;
  } else {
    return await response.json();
  }
};

const filterDocuments = async (
  stakeholders: string | null | undefined,
  scale: string | null | undefined,
  issuanceDate: string | null | undefined,
  type: string | null | undefined,
  language: string | null | undefined
) => {
  try {
    // Crea un oggetto per i parametri
    const params = new URLSearchParams();

    if (stakeholders) params.append("stakeholders", stakeholders);
    if (scale) params.append("scale", scale);
    if (issuanceDate) params.append("issuanceDate", issuanceDate);
    if (type) params.append("type", type);
    if (language) params.append("language", language);

    // Fai la richiesta con i parametri dinamici
    const response = await fetch(
      `${SERVER_URL}/documents?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error filtering documents:", errorData);
      throw new Error(errorData.error || "Failed to filter documents");
    }

    return await response.json();
  } catch (error) {
    console.error("An error occurred while filtering documents:", error);
    throw error;
  }
};

const createZone = async (coordinates: any) => {
  try {
    const response = await fetch(`${SERVER_URL}/zone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ coordinates }),
    });
    if (response.ok) {
      const zoneId = await response.json();
      console.log("zone id is , ", zoneId);
      return zoneId;
    } else {
      const errDetails = await response.json();
      throw new Error(
        errDetails.error ? errDetails.error : errDetails.error[0].msg
      );
    }
  } catch (err) {
    console.error("Error creating custom zone: ", err);
    throw err;
  }
};

const addOriginalResource = async (documentID: number, myFiles: File[]) => {
  try {
    if (!myFiles || myFiles.length === 0) {
      throw new Error("No files provided for upload");
    }

    const formData = new FormData();
    for (let i = 0; i < myFiles.length; i++) {
      formData.append("files", myFiles[i]);
    }
    // myFiles.forEach((file,) => {
    //   files.append(`files`, file); // Use a key to group files
    // });

    console.log("Form data is ", formData);

    const response = await fetch(`${SERVER_URL}/resource/${documentID}`, {
      method: "POST",
      credentials: "include", // Ensures cookies are included if needed
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text(); // Retrieve error message from server
      throw new Error(`File upload failed: ${errorText}`);
    }

    const data = await response.json();
    console.log("Files uploaded successfully:", data);

    return data; // Return the response data for further use
  } catch (error) {
    console.error("An error occurred while adding original resource:", error);
    throw error; // Re-throw to handle errors upstream
  }
};

const handleDownloadResource = async (id: number, fileName: string) => {
  const fileUrl = `http://localhost:3001/api/resource/download/${id}/${fileName}`;

  try {
    const response = await fetch(fileUrl, {
      method: "GET",
      credentials: "include", // Include cookies if necessary
    });

    if (!response.ok) {
      throw new Error("Failed to fetch the file");
    }

    // Convert the response to a Blob
    const blob = await response.blob();

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create a temporary <a> tag to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // Specify the file name for download
    document.body.appendChild(a);
    a.click();

    // Clean up and revoke the object URL
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the file:", error);
    alert("Failed to download the file");
  }
};

const API = {
  login,
  logout,
  currentUser,
  createDocumentNode,
  getZones,
  getDocuments,
  connectDocuments,
  updateGeoreference,
  filterDocuments,
  createZone,
  addOriginalResource,
  handleDownloadResource,
};
export default API;
