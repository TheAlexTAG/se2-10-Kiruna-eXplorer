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
  iconComponent: React.FC;
  connections: number;
  links: { documentID: number; relationship: string }[]; 
};

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
  { label: "Architecture firms", color: "#D3D3D3" },
  { label: "Citizens", color: "#ADD8E6" },
  { label: "Others", color: "#5F9EA0" },
  { label: "Direct consequence", lineStyle: "solid" },
  { label: "Collateral consequence", lineStyle: "5,5" },
  { label: "Projection", lineStyle: "1,5,1,5" },
  { label: "Update", lineStyle: "1,5,5,5" },
];

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
  }, []);

  return <svg ref={svgRef}></svg>;
};
