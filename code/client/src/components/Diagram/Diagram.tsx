import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

type Node = {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  stakeholders: string;
  scale: string;
  issuanceDate: string; // Data come stringa
  type: string;
  iconUrl: string;
  connections: number;
  links: { documentID: number; relationship: string }[]; // Connessioni specifiche
};

// Funzione per parsare la data
const parseDate = (dateStr: string): Date => {
  let parsedDate: Date;

  // Prova a interpretare la data nel formato "DD/MM/YYYY"
  const ddmmyyyy = d3.timeParse("%d/%m/%Y");
  const mmyyyy = d3.timeParse("%m/%Y");
  const yyyy = d3.timeParse("%Y");

  if (ddmmyyyy(dateStr)) {
    parsedDate = ddmmyyyy(dateStr)!;
  } else if (mmyyyy(dateStr)) {
    parsedDate = mmyyyy(dateStr)!;
  } else {
    parsedDate = yyyy(dateStr)!;
  }

  return parsedDate;
};

// Funzione per determinare lo stile della linea in base al tipo di connessione
const getLineStyle = (relationship: string) => {
  switch (relationship) {
    case "direct consequence":
      return "solid"; // Linea continua
    case "collateral consequence":
      return "2,2"; // Linea tratteggiata
    case "projection":
      return "1,1,1,1"; // Linea a puntini
    case "update":
      return "5,5"; // Linea punto-trattino
    default:
      return ""; // Default
  }
};

export const Diagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const data: Node[] = [
    {
      id: 1,
      title: "Town Hall demolition (64)",
      description: "After the construction of the new town hall...",
      latitude: 67.846540237353,
      longitude: 20.230941710255415,
      stakeholders: "LKAB",
      scale: "1:1,000",
      issuanceDate: "2019", // formato YYYY
      type: "Material effect",
      iconUrl: "/img/doc.png",
      connections: 3,
      links: [
        { documentID: 2, relationship: "collateral consequence" },
        { documentID: 3, relationship: "collateral consequence" },
        { documentID: 4, relationship: "collateral consequence" },
      ],
    },
    {
      id: 2,
      title: "Construction of Aurora Center begins (65)",
      description: "Shortly after the construction of the Scandic hotel began...",
      latitude: 67.849167,
      longitude: 20.304389,
      stakeholders: "LKAB",
      scale: "Concept",
      issuanceDate: "2009", // formato YYYY
      type: "Material effect",
      iconUrl: "/img/doc.png",
      connections: 1,
      links: [{ documentID: 1, relationship: "collateral consequence" }],
    },
    {
      id: 3,
      title: "Construction of Block 1 begins (69)",
      description: "Simultaneously with the start of construction on the Aurora Center...",
      latitude: 67.848556,
      longitude: 20.300333,
      stakeholders: "LKAB",
      scale: "Text",
      issuanceDate: "06/2021", // formato MM/YYYY
      type: "Material effect",
      iconUrl: "/img/doc.png",
      connections: 1,
      links: [{ documentID: 1, relationship: "collateral consequence" }],
    },
    {
      id: 4,
      title: "Construction of Scandic Hotel begins (63)",
      description: "After two extensions of the land acquisition agreement...",
      latitude: 67.848528,
      longitude: 20.3047,
      stakeholders: "LKAB",
      scale: "1:100,000",
      issuanceDate: "12/12/2019", // formato DD/MM/YYYY
      type: "Material effect",
      iconUrl: "/img/doc.png",
      connections: 1,
      links: [{ documentID: 1, relationship: "collateral consequence" }],
    },
  ];

  useEffect(() => {
    const width = 1000;
    const height = 600;
    const margin = { top: 40, right: 40, bottom: 40, left: 100 };

    // Define scales and axes
    const scales = [
      "Text",
      "Concept",
      "1:100,000",
      "1:10,000",
      "1:5,000",
      "1:1,000",
      "Blueprints/effect",
    ];

    const years = Array.from({ length: 2024 - 2004 + 1 }, (_, i) => 2004 + i);

    const yScale = d3
      .scalePoint()
      .domain(scales)
      .range([margin.top, height - margin.bottom]);

    const xScale = d3
      .scaleTime()
      .domain([new Date(2004, 0, 1), new Date(2024, 0, 1)])
      .range([margin.left, width - margin.right]);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9f9f9");

    // Clear previous content
    svg.selectAll("*").remove();

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(years.length))
      .attr("font-size", "12px");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr("font-size", "12px");

    // Parse issuance dates into Date objects using the custom date parser
    const nodes = data.map((d) => ({
      ...d,
      issuanceDate: parseDate(d.issuanceDate), // Usa la funzione parseDate
    }));

    // Add nodes as images (icons)
    svg
      .append("g")
      .selectAll("image")
      .data(nodes)
      .join("image")
      .attr("xlink:href", (d) => d.iconUrl)
      .attr("width", 32)
      .attr("height", 32)
      .attr("x", (d) => xScale(d.issuanceDate) - 15) // Centra l'immagine
      .attr("y", (d) => yScale(d.scale) - 15) // Centra l'immagine
      .on("mouseover", (event, d) => {
        d3.select(event.target).attr("opacity", 0.7);
        svg
          .append("text")
          .attr("x", xScale(d.issuanceDate))
          .attr("y", yScale(d.scale) - 30)
          .attr("text-anchor", "middle")
          .attr("class", "tooltip")
          .attr("fill", "black")
          .text(d.title);
      })
      .on("mouseout", (event) => {
        d3.select(event.target).attr("opacity", 1);
        svg.select(".tooltip").remove();
      });

    // Add labels for the nodes
    svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => xScale(d.issuanceDate))
      .attr("y", (d) => yScale(d.scale) + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text((d) => d.title);

    // Aggiungere linee di connessione tra i nodi
    svg
      .append("g")
      .selectAll("path")
      .data(nodes)
      .join("path")
      .attr("d", (sourceNode) => {
        // Per ogni nodo, per ogni link, disegnare la linea
        return sourceNode.links
          .map((link) => {
            const targetNode = nodes.find((node) => node.id === link.documentID);
            if (targetNode) {
              // Calcolare le posizioni X e Y per i due nodi
              const startX = xScale(sourceNode.issuanceDate);
              const startY = yScale(sourceNode.scale);
              const endX = xScale(targetNode.issuanceDate);
              const endY = yScale(targetNode.scale);

              // Restituire il path per la linea
              return `M${startX},${startY} L${endX},${endY}`;
            }
            return "";
          })
          .join(" "); // Unisci i segmenti di path per ogni connessione
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", (sourceNode) => {
        // Per ogni link, passiamo il relationship per determinare lo stile della linea
        return sourceNode.links
          .map((link) => getLineStyle(link.relationship)) // Usa link.relationship
          .join(" ");
      });
  }, []);

  return <svg ref={svgRef} width="100%" height="600"></svg>;
};
