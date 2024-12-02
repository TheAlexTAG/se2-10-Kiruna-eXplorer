import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import AgreementIcon from "../../../public/icons/agreement-icon"
import ConflictIcon from "../../../public/icons/conflict-icon"
import ConsultationIcon from "../../../public/icons/consultation-icon"
import DesignIcon from "../../../public/icons/design-icon"
import InformativeIcon from "../../../public/icons/informative-icon"
import MaterialEffectIcon from "../../../public/icons/material-effect-icon"
import PrescriptiveIcon from "../../../public/icons/prescriptive-icon"
import TechnicalIcon from "../../../public/icons/technical-icon"
import ReactDOMServer from "react-dom/server";

interface IconProps {
  width?: string | number;
  height?: string | number;
  color?: string;
}

type Node = {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  stakeholders: string;
  scale: string;
  issuanceDate: string;
  type: string;
  iconComponent: React.FC<IconProps>;
  connections: number;
  links: { documentID: number; relationship: string }[]; 
};



// Static data 
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
    iconComponent: MaterialEffectIcon,
    connections: 3,
    links: [
      { documentID: 3, relationship: "collateral consequence" },
      { documentID: 4, relationship: "collateral consequence" },
      { documentID: 2, relationship: "direct consequence" },
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
    type: "Agreement",
    iconComponent: AgreementIcon,
    connections: 1,
    links: [
      { documentID: 1, relationship: "direct consequence" },
    ],
  },
  {
    id: 3,
    title: "Construction of Block 1 begins (69)",
    description: "Simultaneously with the start of construction on the Aurora Center...",
    latitude: 67.848556,
    longitude: 20.300333,
    stakeholders: "Others",
    scale: "Text",
    issuanceDate: "06/2021", // formato MM/YYYY
    type: "Conflict",
    iconComponent: ConflictIcon,
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
    type: "Consulatation",
    iconComponent: ConsultationIcon,
    connections: 1,
    links: [{ documentID: 1, relationship: "collateral consequence" }],
  },
  {
    id: 5,
    title: "prova 5",
    description: "After the construction of the new town hall...",
    latitude: 67.846540237353,
    longitude: 20.230941710255415,
    stakeholders: "Citizens",
    scale: "1:10,000",
    issuanceDate: "2007", // formato YYYY
    type: "Design",
    iconComponent: DesignIcon,
    connections: 1,
    links: [
      { documentID: 6, relationship: "projection" },
    ],
  },
  {
    id: 6,
    title: "prova 6",
    description: "After the construction of the new town hall...",
    latitude: 67.846540237353,
    longitude: 20.230941710255415,
    stakeholders: "LKAB, Citizens",
    scale: "1:100,000",
    issuanceDate: "2009", // formato YYYY
    type: "Informative",
    iconComponent: InformativeIcon,
    connections: 1,
    links: [
      { documentID: 5, relationship: "projection" },
    ],
  },
  {
    id: 7,
    title: "prova 7",
    description: "After the construction of the new town hall...",
    latitude: 67.846540237353,
    longitude: 20.230941710255415,
    stakeholders: "Architecture firms",
    scale: "1:5,000",
    issuanceDate: "2013", // formato YYYY
    type: "Prescriptive",
    iconComponent: PrescriptiveIcon,
    connections: 1,
    links: [
      { documentID: 8, relationship: "update" },
    ],
  },
  {
    id: 8,
    title: "prova 8",
    description: "After the construction of the new town hall...",
    latitude: 67.846540237353,
    longitude: 20.230941710255415,
    stakeholders: "Regional authority",
    scale: "1:1,000",
    issuanceDate: "2005", // formato YYYY
    type: "Technical",
    iconComponent: TechnicalIcon,
    connections: 1,
    links: [
      { documentID: 7, relationship: "update" },
    ],
  },
  {
    id: 9,
    title: "prova 9",
    description: "After the construction of the new town hall...",
    latitude: 67.846540237353,
    longitude: 20.230941710255415,
    stakeholders: "Municipality",
    scale: "Blueprints/effect",
    issuanceDate: "2009", // formato YYYY
    type: "Technical",
    iconComponent: TechnicalIcon,
    connections: 0,
    links: [],
  },
];


// Legend Data
const legendData = [
  { label: "Design doc.", icon: <DesignIcon width = "15px" height = "15px" color = "black" /> },
  { label: "Informative doc.", icon: <InformativeIcon width = "15px" height = "15px" color = "black"/> },
  { label: "Prescriptive doc.", icon: <PrescriptiveIcon width = "15px" height = "15px" color = "black"/> },
  { label: "Technical doc.", icon: <TechnicalIcon width = "15px" height = "15px" color = "black"/> },
  { label: "Agreement", icon: <AgreementIcon width = "15px" height = "15px" color = "black"/> },
  { label: "Conflict", icon: <ConflictIcon width = "15px" height = "15px" color = "black"/> },
  { label: "Consultation", icon: <ConsultationIcon width = "15px" height = "15px" color = "black"/> },
  { label: "Material effects", icon: <MaterialEffectIcon width = "15px" height = "15px" color = "black"/> },
  { label: "LKAB", color: "#000000" },
  { label: "Municipality", color: "#B38676" },
  { label: "Regional authority", color: "#A42121" },
  { label: "Architecture firms", color: "#A9A9A9" },
  { label: "Citizens", color: "#87CEEB" },
  { label: "Others", color: "#5F9EA0" },
  { label: "More than 1", color: "#1D2D7A" },
  { label: "Direct consequence", lineStyle: "solid" },
  { label: "Collateral consequence", lineStyle: "5,5" },
  { label: "Projection", lineStyle: "1,5,1,5" },
  { label: "Update", lineStyle: "1,5,5,5" },
];

// Definisci una funzione per mappare il valore di stakeholder a un colore
const getColor = (stakeholder: string) => {
  switch (stakeholder) {
    case "LKAB": return "#000000";
    case "Municipality": return "#B38676";
    case "Regional authority": return "#A42121";
    case "Architecture firms": return "#A9A9A9";
    case "Citizens": return "#87CEEB";
    case "Others": return "#5F9EA0";
    default: return "#1D2D7A";
  }
};

  // Function to parse the date string into a Date object
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

  // Function for line style based on relationship
const getLineStyle = (relationship: string) => {
  switch (relationship) {
    case "direct consequence":
      return "solid"; // continue line
    case "collateral consequence":
      return "5,5"; // dashed line
    case "projection":
      return "1,5,1,5"; // dotted line
    case "update":
      return "1,5,5,5"; // dash-dot line
    default:
      return "";
  }
};



export const Diagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const width = 1500;
    const height = 750;
    const margin = { top: 20, right: 300, bottom: 200, left: 100 };

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

    // Define y scale
    const yScale = d3
      .scalePoint()
      .domain([...scales, ""]) 
      .range([margin.top, height - margin.bottom]);

    const startDate = new Date(2004, 0, 1);
    const endDate = new Date(2024, 0, 1);

    // Define x scale
    const xScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([margin.left, width - margin.right]);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9f9f9");

    // Clear previous content
    svg.selectAll("*").remove();

    // Add legend
    const legendGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left - 75}, ${margin.top})`);

    let currentY = 0;

    // Node types
    legendGroup
      .append("text")
      .text("Node types:")
      .attr("x", 0)
      .attr("y", 5)
      .attr("font-size", 12)
      .attr("font-weight", "bold")
      .attr("alignment-baseline", "middle");

    legendData
      .filter((item) => item.icon)
      .forEach((item) => {
        const legendItem = legendGroup.append("g").attr("transform", `translate(0, ${currentY})`);
        
        legendItem
          .append("text")
          .text(item.label)
          .attr("x", 190)
          .attr("y", 5)
          .attr("font-size", 10)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end");

        legendItem
          .append("g")
          .html(ReactDOMServer.renderToStaticMarkup(item.icon))
          .attr("transform", `translate(200, -5)`);

        currentY += 20; // Update Y position for next item
      });

      currentY += 20;

      // Stakeholders
      legendGroup
        .append("text")
        .text("Stakeholders:")
        .attr("x", 0)
        .attr("y", currentY + 5)
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("alignment-baseline", "middle");
  
      legendData
        .filter((item) => item.color) // Solo gli elementi con colori
        .forEach((item) => {
          const legendItem = legendGroup.append("g").attr("transform", `translate(0, ${currentY})`);
  
          legendItem
            .append("text")
            .text(item.label)
            .attr("x", 190)
            .attr("y", 5)
            .attr("font-size", 10)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "end");
  
          legendItem
            .append("rect")
            .attr("x", 200)
            .attr("y", -5)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", item.color);
  
          currentY += 20;
        });
  
      currentY += 20;
  
      // Connections
      legendGroup
        .append("text")
        .text("Connections:")
        .attr("x", 0)
        .attr("y", currentY + 5)
        .attr("font-size", 12)
        .attr("font-weight", "bold")
        .attr("alignment-baseline", "middle");
  
      legendData
        .filter((item) => item.lineStyle) // Solo gli elementi con stili di linea
        .forEach((item) => {
          const legendItem = legendGroup.append("g").attr("transform", `translate(0, ${currentY})`);
  
          legendItem
            .append("text")
            .text(item.label)
            .attr("x", 190)
            .attr("y", 5)
            .attr("font-size", 10)
            .attr("alignment-baseline", "middle")
            .attr("text-anchor", "end");
  
          legendItem
            .append("line")
            .attr("x1", 200)
            .attr("x2", 235)
            .attr("y1", 5)
            .attr("y2", 5)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", item.lineStyle === "solid" ? "" : item.lineStyle);
  
          currentY += 20;
        });
  

    // Add graph group
    const graphGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 150}, 0)`);

    // Add axes
    graphGroup
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(years.length))
      .attr("font-size", "12px");

    graphGroup
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr("font-size", "12px");

    // Parse issuance dates into Date objects using the custom date parser
    const nodes = data.map((d) => ({
      ...d,
      issuanceDate: parseDate(d.issuanceDate), // Usa la funzione parseDate
    }));

    // Add nodes
    graphGroup
      .selectAll("g.node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${xScale(d.issuanceDate)}, ${yScale(d.scale)})`)
      .each(function (d) {
        const node = d3.select(this);

        // Add icon
        node
          .append("g")
          .html(ReactDOMServer.renderToStaticMarkup(<d.iconComponent width = "32px" height = "32px" 
            color = {getColor(d.stakeholders)} />))
          .attr("transform", "translate(-15, -15)");
      });

      // Add labels for the nodes
    graphGroup
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => xScale(d.issuanceDate))
      .attr("y", (d) => yScale(d.scale) + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text((d) => d.title);

    // Add lines (links) between nodes
    graphGroup
      .append("g")
      .selectAll("path")
      .data(nodes.flatMap((sourceNode) =>
        sourceNode.links.map((link) => ({
          sourceNode,
          targetNode: nodes.find((node) => node.id === link.documentID),
          relationship: link.relationship,
        }))
      ))
      .join("path")
      .attr("d", ({ sourceNode, targetNode }) => {
        if (targetNode) {
          const startX = xScale(sourceNode.issuanceDate);
          const startY = yScale(sourceNode.scale);
          const endX = xScale(targetNode.issuanceDate);
          const endY = yScale(targetNode.scale);

          return `M${startX},${startY} L${endX},${endY}`;
        }
        return "";
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", ({ relationship }) => getLineStyle(relationship)); 

  }, []);

  return <svg ref={svgRef}></svg>;
};
