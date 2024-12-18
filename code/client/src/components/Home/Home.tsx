import { Button, Col, Row } from "react-bootstrap";
import "./Home.css";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();
  const handleScroll = (event: React.WheelEvent) => {
    if (event.deltaY > 0) {
      // Scroll Down
      window.scrollTo({
        top: document.body.scrollHeight, // Scroll to the bottom of the page
        behavior: "smooth",
      });
    } else {
      // Scroll Up
      window.scrollTo({
        top: 0, // Scroll to the top of the page
        behavior: "smooth",
      });
    }
  };
  return (
    <>
      <div className="main-home" onWheel={handleScroll}>
        {/* <div className="custom-background"></div> */}
        <div>
          <div className="home-details d-grid align-items-center justify-contents-center text-center">
            <div className="main-body">
              <h1 className="main-title">Kiruna Explorer</h1>
              In the heart of Sweden's Arctic wilderness, Kiruna is making
              history by moving an entire city. Perched atop Europe’s largest
              iron ore mine, the ground beneath it is cracking. But instead of
              abandoning their home, 20,000 residents are taking a bold
              step—relocating their city, buildings and all, in a one-of-a-kind
              urban migration.
            </div>
          </div>
          <div className="main-func">
            <div
              tabIndex={0}
              role="button"
              className="w-100"
              onClick={() => navigate("/map")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault(); // Prevent scrolling on Space
                  event.currentTarget.click(); // Trigger onClick
                }
              }}
            >
              <Button className="w-100" variant="link">
                <Row className="m-0 p-0">
                  <Col md={9} className="m-0 p-0">
                    <div className="function-title first-background">
                      <span>Explore The Map</span>
                    </div>
                  </Col>
                  <Col
                    md={3}
                    className="function-image d-flex justify-content-center align-items-center m-0 p-0 "
                  >
                    <div className="function-image">
                      <img src="./src/assets/map.png" />
                    </div>
                  </Col>
                </Row>
              </Button>
            </div>
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigate("/document")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault(); // Prevent scrolling on Space
                  event.currentTarget.click(); // Trigger onClick
                }
              }}
            >
              <Button className="w-100" variant="link">
                <Row className="m-0 p-0">
                  <Col
                    md={3}
                    className="function-image d-flex justify-content-center align-items-center m-0 p-0 "
                  >
                    <div className="function-image">
                      <img src="./src/assets/documents.png" />
                    </div>
                  </Col>
                  <Col md={9} className="m-0 p-0">
                    <div className="function-title second-background">
                      <span>Explore Documents</span>
                    </div>
                  </Col>
                </Row>
              </Button>
            </div>
            <div
              tabIndex={0}
              role="button"
              onClick={() => navigate("/diagram")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault(); // Prevent scrolling on Space
                  event.currentTarget.click(); // Trigger onClick
                }
              }}
            >
              {" "}
              <Button className="w-100" variant="link">
                <Row className="m-0 p-0">
                  <Col md={9} className="m-0 p-0">
                    <div className="function-title first-background">
                      <span>Explore The Diagram</span>
                    </div>
                  </Col>
                  <Col
                    md={3}
                    className="function-image d-flex justify-content-center align-items-center m-0 p-0 "
                  >
                    <div className="function-image">
                      <img src="./src/assets/diagram.png" />
                    </div>
                  </Col>
                </Row>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
