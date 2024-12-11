import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import ReactDOMServer from "react-dom/server";
import AgreementIcon from "../../assets/icons/agreement-icon";
import ConflictIcon from "../../assets/icons/conflict-icon";
import ConsultationIcon from "../../assets/icons/consultation-icon";
import DesignIcon from "../../assets/icons/design-icon";
import InformativeIcon from "../../assets/icons/informative-icon";
import MaterialEffectIcon from "../../assets/icons/material-effect-icon";
import PrescriptiveIcon from "../../assets/icons/prescriptive-icon";
import TechnicalIcon from "../../assets/icons/technical-icon";
import DocDefaultIcon from "../../assets/icons/doc-default-icon";
import API from "../../API/API";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import L from "leaflet";

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
  attachment: [];
  resource: [];
  parsedScale: number;
  parsedDate: Date;
};

// Legend Data
const legendData = [
  {
    label: "Design doc.",
    icon: <DesignIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Informative doc.",
    icon: <InformativeIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Prescriptive doc.",
    icon: <PrescriptiveIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Technical doc.",
    icon: <TechnicalIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Agreement",
    icon: <AgreementIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Conflict",
    icon: <ConflictIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Consultation",
    icon: <ConsultationIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Material effects",
    icon: <MaterialEffectIcon width="15px" height="15px" color="black" />,
  },
  {
    label: "Default doc.",
    icon: <DocDefaultIcon width="15px" height="15px" color="black" />,
  },
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
    case "LKAB":
      return "#000000";
    case "Municipality":
      return "#B38676";
    case "Regional authority":
      return "#A42121";
    case "Architecture firms":
      return "#A9A9A9";
    case "Citizens":
      return "#87CEEB";
    case "Others":
      return "#5F9EA0";
    default:
      return "#1D2D7A";
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

const parseScale = (scale: string): Number | String => {
  if (scale.split(":")[0] != "1") return scale;
  const parts = scale.split(":");
  const numericValue = parseInt(parts[1].replace(/[.,]/g, ""), 10);
  return numericValue;
};

const getLineStyle = (relationship: string) => {
  switch (relationship) {
    case "Direct consequence":
      return "solid";
    case "Collateral consequence":
      return "5,5";
    case "Projection":
      return "1,5,1,5";
    case "Update":
      return "1,5,5,5";
    default:
      return "";
  }
};

// Mappa il tipo di documento a un'icona
const getIconComponent = (type: string): React.FC<IconProps> => {
  switch (type) {
    case "Design doc.":
      return DesignIcon;
    case "Informative doc.":
      return InformativeIcon;
    case "Prescriptive doc.":
      return PrescriptiveIcon;
    case "Technical doc.":
      return TechnicalIcon;
    case "Agreement":
      return AgreementIcon;
    case "Conflict":
      return ConflictIcon;
    case "Consultation":
      return ConsultationIcon;
    case "Material effect":
      return MaterialEffectIcon;
    default:
      return DocDefaultIcon; // Fallback
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
    attachment: doc.attachment,
    resource: doc.resource,
    parsedScale: parseScale(doc.scale),
    parsedDate: parseDate(doc.issuanceDate),
    pages: doc.pages,
    language: doc.language
  }));
};

export const Diagram: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  const getIconByType = (type: string) => {
    const iconUrls: { [key: string]: string } = {
      Agreement: "/img/agreement-icon.png",
      Conflict: "/img/conflict-icon.png",
      Consultation: "/img/consultation-icon.png",
      "Material effect": "/img/worker.png",
      default: "/img/doc.png",
    };

    return L.icon({
      iconUrl: iconUrls[type] || iconUrls.default,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  };

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

    const startDate = new Date(2004, 0, 1);
    const endDate = new Date(2025, 0, 1);
    const newYDomain = [
      "Concept",
      "Text",
      ...nodes
        .map((node: Node) => node.parsedScale)
        .sort((a: any, b: any) => b - a),
      "Blueprints/effects",
      "",
    ];

    const yScale = d3
      .scalePoint()
      .domain(newYDomain as Iterable<string>)
      .range([margin.top, height - margin.bottom]);
    const xScale = d3
      .scaleTime()
      .domain([startDate, endDate])
      .range([margin.left, width - margin.right]);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9f9f9");

    svg.selectAll("*").remove();

    // Add grid
    const gridGroup = svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left + 150}, 0)`);

    // Horizontal grid lines
    gridGroup
      .selectAll(".horizontal-line")
      .data(yScale.domain())
      .enter()
      .append("line")
      .attr("class", "horizontal-line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (d) => yScale(d)!)
      .attr("y2", (d) => yScale(d)!)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

    // Vertical grid lines
    const xTicks = xScale.ticks(20); // Ottieni i tick dall'asse temporale
    gridGroup
      .selectAll(".vertical-line")
      .data(xTicks)
      .enter()
      .append("line")
      .attr("class", "vertical-line")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5);

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
        const legendItem = legendGroup
          .append("g")
          .attr("transform", `translate(0, ${currentY})`);

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
        const legendItem = legendGroup
          .append("g")
          .attr("transform", `translate(0, ${currentY})`);

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
          .attr("fill", item.color!);

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
        const legendItem = legendGroup
          .append("g")
          .attr("transform", `translate(0, ${currentY})`);

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
          .attr(
            "stroke-dasharray",
            item.lineStyle === "solid" ? "" : item.lineStyle!
          );

        currentY += 20;
      });

    const graphGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left + 150}, 0)`);

    graphGroup
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(20))
      .attr("font-size", "12px");

    graphGroup
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale).tickFormat((d: any) => {
          if (
            d === "Concept" ||
            d === "Text" ||
            d === "Blueprints/effects" ||
            typeof d != "number"
          ) {
            return d;
          } else return `1:${d.toLocaleString("en-US")}`;
        })
      )
      .attr("font-size", "12px");

    const nodeData = nodes.map((d) => ({
      ...d,
    }));

    graphGroup
      .selectAll("g.node")
      .data(nodeData)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d) =>
          `translate(${xScale(d.parsedDate)}, ${yScale(
            d.parsedScale as unknown as string
          )})`
      )
      .each(function (d) {
        const node = d3.select(this);

        node
          .append("g")
          .html(
            ReactDOMServer.renderToStaticMarkup(
              <d.iconComponent
                width="25px"
                height="25px"
                color={getColor(d.stakeholders)}
              />
            )
          )
          .attr("transform", "translate(-10, -10)");

        node
          .append("rect")
          .attr("x", -20) // Un po' più grande rispetto all'icona
          .attr("y", -20) // Un po' più grande rispetto all'icona
          .attr("width", 40) // Aumenta la larghezza per l'area di hover
          .attr("height", 40) // Aumenta l'altezza per l'area di hover
          .attr("fill", "transparent"); // Rendi il rettangolo invisibile

        // Aggiungi il testo, inizialmente nascosto
        node
          .append("text")
          .attr("x", 0)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .style("visibility", "hidden")
          .text(d.title);

        // Gestisci gli eventi di hover per ogni nodo
        node
          .on("mouseover", function () {
            d3.select(this).select("text").style("visibility", "visible"); // Mostra il testo quando hover
          })
          .on("mouseout", function () {
            d3.select(this).select("text").style("visibility", "hidden"); // Nascondi il testo quando il mouse esce
          })
          .on("click", function (event, d) {
            setSelectedDocument(d);
          });
      });

    const seenLinks = new Set();
    graphGroup
      .append("g")
      .selectAll("path")
      .data(
        nodeData.flatMap((sourceNode) =>
          sourceNode.links
            .map((link, index) => ({
              sourceNode,
              targetNode: nodeData.find((node) => node.id === link.documentID),
              relationship: link.relationship,
              index,
            }))
            .filter(({ sourceNode, targetNode, relationship }) => {
              if (targetNode) {
                const linkKey = [sourceNode.id, targetNode.id, relationship].sort().join("-");
                if (seenLinks.has(linkKey)) {
                  return false; 
                }
                seenLinks.add(linkKey); 
              }
              return true; 
            })
        )
      )
      .enter()
      .append("path")
      .attr("d", ({ sourceNode, targetNode, index }) => {
        if (targetNode) {
          const startX = xScale(sourceNode.parsedDate);
          const startY = yScale(sourceNode.parsedScale as unknown as string);
          const endX = xScale(targetNode.parsedDate);
          const endY = yScale(targetNode.parsedScale as unknown as string);

          // Calcolo di un punto di controllo per la curva
          const controlX = (startX + endX) / 2; // Punto medio sull'asse X
          const controlY = (startY! + endY!) / 2 - 50 - index * 50; // Punto medio sull'asse Y con offset per separare le curve

          // Genera una curva quadratica Bezier
          return `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`;
        }
        return "";
      })
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", ({ relationship }) =>
        getLineStyle(relationship)
      );
    
    // Clustering logic
    const clusterThreshold = 25;
    const clusteredNodes: {
      clusterId: number;
      x: number;
      y: number;
      nodes: Node[];
    }[] = [];


    nodes.forEach((node) => {
      const x = xScale(parseDate(node.issuanceDate));
      const y = yScale(node.scale);

      // Cerca se il nodo può essere raggruppato in un cluster esistente
      let addedToCluster = false;

      clusteredNodes.forEach((cluster) => {
        const distance = Math.sqrt((x - cluster.x) ** 2 + (y! - cluster.y) ** 2);
        if (distance < clusterThreshold) {
          cluster.nodes.push(node);
          cluster.x =
            (cluster.x * (cluster.nodes.length - 1) + x) / cluster.nodes.length;
          cluster.y =
            (cluster.y * (cluster.nodes.length - 1) + y) / cluster.nodes.length;
          addedToCluster = true;
        }
      });

      if (!addedToCluster) {
        clusteredNodes.push({
          clusterId: clusteredNodes.length,
          x,
          y,
          nodes: [node],
        });
      }
    });

    const filteredClusters = clusteredNodes.filter(
      (cluster) => cluster.nodes.length > 1
    );

    // Disegna i cluster
    filteredClusters.forEach((cluster) => {
      const { x, y, nodes: clusterNodes } = cluster;

      // Nascondi i nodi che appartengono al cluster
      clusterNodes.forEach((node) => {
        graphGroup
          .selectAll(`g.node`)
          .filter((d) => d.id === node.id)
          .style("visibility", "hidden");
      });

      // Disegna il cerchio del cluster
      const clusterCircle = graphGroup
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 15)
        .attr("fill", "#3182CE")
        .attr("opacity", 0.8)
        .style("cursor", "pointer")
        .classed("cluster", true);

      // Etichetta del cluster
      const clusterLabel = graphGroup
        .append("text")
        .attr("x", x)
        .attr("y", y + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "white")
        .text(clusterNodes.length)
        .classed("cluster-label", true);

      // Gestione stato del cluster (aperto/chiuso)
      let isExpanded = false;

      // Evento click sul cluster
      clusterCircle.on("click", () => {
        if (!isExpanded) {
          // Espandi i nodi intorno al cluster
          const angleStep = (2 * Math.PI) / clusterNodes.length;
          clusterNodes.forEach((node, index) => {
            const angle = index * angleStep;
            const nodeX = x + 30 * Math.cos(angle);
            const nodeY = y + 30 * Math.sin(angle);

            graphGroup
              .selectAll("g.node")
              .filter((d) => d.id === node.id)
              .attr("transform", `translate(${nodeX}, ${nodeY})`)
              .style("visibility", "visible");

            });

          // Modifica il cluster per mostrare la "X"
          clusterLabel.text("X");
          clusterCircle.attr("fill", "#FF0000");

          isExpanded = true;
        } else {
          // Collassa i nodi all'interno del cluster
          clusterNodes.forEach((node) => {
            graphGroup
              .selectAll("g.node")
              .filter((d) => d.id === node.id)
              .attr("transform", `translate(${x}, ${y})`)
              .style("visibility", "hidden");
          });

          // Ripristina il cluster
          clusterLabel.text(clusterNodes.length);
          clusterCircle.attr("fill", "#3182CE");

          isExpanded = false;
        }
      });
  });
  }, [nodes]);

  return (
    <>
      <svg ref={svgRef}></svg>
      {selectedDocument && (
        <DocumentCard
          cardInfo={selectedDocument}
          iconToShow={getIconByType(selectedDocument.type).options.iconUrl}
          setSelectedDocument={setSelectedDocument}
          inDiagram={true}
        />
      )}
    </>
  );
};
