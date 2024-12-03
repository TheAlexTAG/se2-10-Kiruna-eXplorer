import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ReactDOMServer from "react-dom/server";
import AgreementIcon from "../../../public/icons/agreement-icon";
import ConflictIcon from "../../../public/icons/conflict-icon";
import ConsultationIcon from "../../../public/icons/consultation-icon";
import DesignIcon from "../../../public/icons/design-icon";
import InformativeIcon from "../../../public/icons/informative-icon";
import MaterialEffectIcon from "../../../public/icons/material-effect-icon";
import PrescriptiveIcon from "../../../public/icons/prescriptive-icon";
import TechnicalIcon from "../../../public/icons/technical-icon";
import API from "../../API/API"

interface IconProps {
  width?: string | number;
  height?: string | number;
  color?: string;
}

type Node = {
  id: number;
  title: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  stakeholders: string;
  scale: string;
  issuanceDate: string;
  type: string;
  iconComponent: React.FC<IconProps>;
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
  { label: "Architecture firms", color: "#A9A9A9" },
  { label: "Citizens", color: "#87CEEB" },
  { label: "Others", color: "#5F9EA0" },
  { label: "More than 1", color: "#1D2D7A" },
  { label: "Direct consequence", lineStyle: "solid" },
  { label: "Collateral consequence", lineStyle: "5,5" },
  { label: "Projection", lineStyle: "1,5,1,5" },
  { label: "Update", lineStyle: "1,5,5,5" },
];

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

const parseDate = (dateStr: string): Date => {
  const ddmmyyyy = d3.timeParse("%d/%m/%Y");
  const mmyyyy = d3.timeParse("%m/%Y");
  const yyyy = d3.timeParse("%Y");

  if (ddmmyyyy(dateStr)) {
    return ddmmyyyy(dateStr)!;
  } else if (mmyyyy(dateStr)) {
    return mmyyyy(dateStr)!;
  } else {
    return yyyy(dateStr)!;
  }
};

const getLineStyle = (relationship: string) => {
  switch (relationship) {
    case "Direct consequence": return "solid";
    case "Collateral consequence": return "5,5";
    case "Projection": return "1,5,1,5";
    case "Update": return "1,5,5,5";
    default: return "";
  }
};

// Mappa il tipo di documento a un'icona
const getIconComponent = (type: string): React.FC<IconProps> => {
  switch (type) {
    case "Design doc.": return DesignIcon;
    case "Informative doc.": return InformativeIcon;
    case "Prescriptive doc.": return PrescriptiveIcon;
    case "Technical doc.": return TechnicalIcon;
    case "Agreement": return AgreementIcon;
    case "Conflict": return ConflictIcon;
    case "Consultation": return ConsultationIcon;
    case "Material effect": return MaterialEffectIcon;
    default: return DesignIcon; // Fallback
  }
};

const fetchDocuments = async (): Promise<Node[]> => {
  const response = await API.getDocuments(); // Cambia l'endpoint se necessario

  return response.map((doc: any) => ({
    id: doc.id,
    title: doc.title,
    description: doc.description,
    latitude: doc.latitude,
    longitude: doc.longitude,
    stakeholders: doc.stakeholders,
    scale: doc.scale,
    issuanceDate: doc.issuanceDate,
    type: doc.type,
    iconComponent: getIconComponent(doc.type),
    connections: doc.connections,
    links: doc.links,
  }));
};

export const Diagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const fetchedNodes = await fetchDocuments();
      setNodes(fetchedNodes);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (nodes.length === 0) return;

    const width = 1500;
    const height = 750;
    const margin = { top: 20, right: 300, bottom: 200, left: 100 };

    const scales = [
      "Text",
      "Concept",
      "1:100,000",
      "1:10,000",
      "1:5,000",
      "1:1,000",
      "Blueprints/effect",
    ];

    const startDate = new Date(2004, 0, 1);
    const endDate = new Date(2025, 0, 1);

    const yScale = d3.scalePoint().domain([...scales, ""]).range([margin.top, height - margin.bottom]);
    const xScale = d3.scaleTime().domain([startDate, endDate]).range([margin.left, width - margin.right]);

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9f9f9");

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


    const graphGroup = svg.append("g").attr("transform", `translate(${margin.left + 150}, 0)`);

    graphGroup.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(20))
      .attr("font-size", "12px");

    graphGroup.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr("font-size", "12px");

    const nodeData = nodes.map((d) => ({
      ...d,
      issuanceDate: parseDate(d.issuanceDate),
    }));

    console.log("nodeData" , nodeData);

    graphGroup.selectAll("g.node")
      .data(nodeData)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${xScale(d.issuanceDate)}, ${yScale(d.scale)})`)
      .each(function (d) {
        const node = d3.select(this);

        node.append("g")
          .html(ReactDOMServer.renderToStaticMarkup(<d.iconComponent width="32px" height="32px" color={getColor(d.stakeholders)} />))
          .attr("transform", "translate(-15, -15)");
      });

    // Add labels for the nodes
    graphGroup
      .append("g")
      .selectAll("text")
      .data(nodeData)
      .join("text")
      .attr("x", (d) => xScale(d.issuanceDate))
      .attr("y", (d) => yScale(d.scale) + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .text((d) => d.title);


    graphGroup
      .append("g")
      .selectAll("path")
      .data(nodeData.flatMap((sourceNode) =>
        sourceNode.links.map((link, index) => ({
          sourceNode,
          targetNode: nodeData.find((node) => node.id === link.documentID),
          relationship: link.relationship,
          index
        }))
      ))
      .enter()
      .append("path")
      .attr("d", ({ sourceNode, targetNode, index }) => {
        if (targetNode) {
          const startX = xScale(sourceNode.issuanceDate);
          const startY = yScale(sourceNode.scale);
          const endX = xScale(targetNode.issuanceDate);
          const endY = yScale(targetNode.scale);

           // Calcolo di un punto di controllo per la curva
          const controlX = (startX + endX) / 2; // Punto medio sull'asse X
          const controlY = ((startY + endY) / 2) - 50 - index * 50; // Punto medio sull'asse Y con offset per separare le curve

           // Genera una curva quadratica Bezier
          return `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`;
        }
        return "";
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", ({ relationship }) => getLineStyle(relationship));
  }, [nodes]);

  return <svg ref={svgRef}></svg>;
};
