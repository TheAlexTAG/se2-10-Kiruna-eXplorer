import { Dispatch, SetStateAction, useState } from "react";
import API from "../../../API/API";
import { Button, Card, Col, Collapse, Form } from "react-bootstrap";

interface FilterPropsMap {
  documents: any;
  setFilteredDocuments: Dispatch<SetStateAction<any>>;
  filterVisible: boolean;
}

export const FilterDocsMap: React.FC<FilterPropsMap> = ({
  documents,
  setFilteredDocuments,
  filterVisible,
}) => {
  const [filters, setFilters] = useState({
    stakeholders: "",
    scale: "",
    issuanceDate: "",
    type: "",
    language: "",
  });
  const stakeholderOptions: string[] = [
    "LKAB",
    "Municipalty",
    "Regional authority",
    "Architecture firms",
    "Citizens",
    "Kiruna kommun",
    "Others",
  ];

  const typeOptions: string[] = [
    "Design doc.",
    "Informative doc.",
    "Prescriptive doc.",
    "Technical doc.",
    "Agreement",
    "Conflict",
    "Consultation",
    "Material effect",
  ];

  const applyFilters = async () => {
    try {
      const filteredData = await API.filterDocuments(
        filters.stakeholders || undefined,
        filters.scale || undefined,
        filters.issuanceDate || undefined,
        filters.type || undefined,
        filters.language || undefined
      );
      setFilteredDocuments(filteredData);
    } catch (error) {
      console.error("Error applying filters:", error);
    }
  };
  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      stakeholders: "",
      scale: "",
      issuanceDate: "",
      type: "",
      language: "",
    });
    setFilteredDocuments(documents);
  };

  return (
    <Collapse in={filterVisible}>
      <Card
        data-bs-theme="dark"
        className="main-text"
        style={{
          width: "310px",
          position: "absolute",
          right: "32px",
          zIndex: "999",
          top: "140px",
        }}
      >
        <h3>Filters</h3>

        <Form className="mb-3 filter-card" data-bs-theme="dark">
          <Form.Group as={Col} controlId="filterStakeholders">
            <Form.Label>Stakeholders</Form.Label>
            <Form.Select
              name="stakeholders"
              value={filters.stakeholders}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange(event)
              }
            >
              <option value="">Select Stakeholder</option>
              {stakeholderOptions.map((stakeholder) => (
                <option key={stakeholder} value={stakeholder}>
                  {stakeholder}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group as={Col} controlId="filterScale">
            <Form.Label>Scale</Form.Label>
            <Form.Select
              name="scale"
              value={filters.scale}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange(event)
              }
            >
              <option value="">Select Scale</option>
              <option value="Blueprints/effects">Blueprints/effects</option>
              <option value="1:1,000">1:1,000</option>
              <option value="1:5,000">1:5,000</option>
              <option value="1:10,000">1:10,000</option>
              <option value="1:100,000">1:100,000</option>
              <option value="Concept">Concept</option>
              <option value="Text">Text</option>
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} controlId="filterIssuanceDate">
            <Form.Label>Issuance Date</Form.Label>
            <Form.Control
              type="text"
              placeholder="DD/MM/YYYY"
              name="issuanceDate"
              value={filters.issuanceDate}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                handleFilterChange(event)
              }
            />
          </Form.Group>
          <Form.Group as={Col} controlId="filterType">
            <Form.Label>Type</Form.Label>
            <Form.Select
              name="type"
              value={filters.type}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange(event)
              }
            >
              <option value="">Select Type</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group as={Col} controlId="filterLanguage">
            <Form.Label>Language</Form.Label>
            <Form.Select
              name="language"
              value={filters.language}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                handleFilterChange(event)
              }
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Swedish">Swedish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Russian">Russian</option>
              <option value="Arabic">Arabic</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Button variant="primary" onClick={applyFilters}>
              Apply
            </Button>
            <Button variant="outline-danger" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </Form>
      </Card>
    </Collapse>
  );
};
