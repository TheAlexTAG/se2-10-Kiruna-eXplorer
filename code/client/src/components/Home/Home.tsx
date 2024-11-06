import { Col, Container, Row } from "react-bootstrap"

export const Home = () => {
    return (
        <>
            <div >
            <Container>
                <Row className="w-100" style={{ marginBottom: '5rem' }}>
                    <Col>
                        <div>
                            <img src="./src/assets/kiruna.webp"
                            style={{ width: '100%' }}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div>
                        <p>A City on the Move:</p>
                        <p>Kiruna's Extraordinary Journey Nestled in the Arctic 
                        wilderness of Sweden, Kiruna is writing history as the 
                        first entire city to pack up and move. This isn't science 
                        fiction it's the remarkable story of 20,000 people whose 
                        hometown sits atop Europe's largest iron ore mine. Here, 
                        where the sun never sets for 45 days each summer and 
                        disappears entirely for 21 winter days, an unprecedented 
                        urban migration is taking place. The ground beneath the 
                        city is slowly cracking, and rather than abandon their home, 
                        the people of Kiruna chose to take their city with them 
                        buildings and all.</p>
                        </div>
                        </Col>
                </Row>

                <Row className="w-100" style={{ marginBottom: '5rem' }}>
                    <Col>
                        <div>
                        <p>Engineering Marvel Meets Cultural Preservation:</p>
                        <p>Imagine moving an entire church that weighs as much as 40 adult whales, 
                            or relocating historic buildings that have weathered a century of Arctic 
                            storms. That's exactly what's happening in Kiruna. The relocation project 
                            isn't just about building new structures it's a delicate dance of 
                            preserving the city's soul while embracing its future. The ambitious plan 
                            includes not only constructing a brand new city center but also carefully 
                            transplanting 21 historic buildings to their new home. The crown jewel of 
                            this preservation effort is the beloved Kiruna Church, voted Sweden's most 
                            beautiful pre-1950s building, which will make its historic journey in summer 2025.</p>
                        </div>
                    </Col>

                    <Col>
                        <div>
                           <img src="./src/assets/kiruna-move.jpg"
                            style={{ width: '100%' }}
                            />
                        </div>
                        </Col>
                </Row>
                
                <Row className="w-100">
                    <Col>
                        <div>
                            <img src="./src/assets/kiruna-city.webp"
                            style={{width: '100%'}}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div>
                            <p>A New Chapter in Arctic Urban Design</p>
                            <p>Kiruna's transformation is more than a response to necessity 
                            it's becoming a blueprint for innovative urban planning in the 21st 
                            century. The new city center, unveiled in September 2022, showcases 
                            modern Scandinavian architecture while honoring the region's mining 
                            heritage and indigenous Sami culture. With the completion of the 
                            striking Scandic Hotel, Aurora Congress Center, and sustainable 
                            residential blocks, Kiruna is emerging as a model of how cities can 
                            reinvent themselves while keeping their community spirit alive. 
                            This isn't just a relocation it's a renaissance, proving that 
                            sometimes the biggest challenges lead to the most inspiring solutions.</p>
                        </div>
                        </Col>
                </Row>
            </Container>

            </div>
        </>
    )
}