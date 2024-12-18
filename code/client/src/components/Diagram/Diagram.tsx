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
import { Dropdown, Button, ButtonGroup } from "react-bootstrap";
import ReactDOM from "react-dom";
import { useLocation } from "react-router-dom";
import "./Diagram.css";

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
  links: { linkID: number; documentID: number; relationship: string }[];
  attachment: [];
  resource: [];
  parsedScale: number;
  parsedDate: Date;
  x: number;
  y: number;
};

// Legend Data
const legendData = [
  {
    label: "Design doc.",
    icon: <DesignIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Informative doc.",
    icon: <InformativeIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Prescriptive doc.",
    icon: <PrescriptiveIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Technical doc.",
    icon: <TechnicalIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Agreement",
    icon: <AgreementIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Conflict",
    icon: <ConflictIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Consultation",
    icon: <ConsultationIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Material effects",
    icon: <MaterialEffectIcon width="20px" height="20px" color="black" />,
  },
  {
    label: "Default doc.",
    icon: <DocDefaultIcon width="20px" height="20px" color="black" />,
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
  // Verifica se ci sono più stakeholder separati da virgole
  if (stakeholder.includes(",")) {
    return "#1D2D7A";
  }
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
    default:
      return "#5F9EA0";
  }
};

const parseDate = (dateStr: string): Date => {
  const ddmmyyyy = d3.timeParse("%Y-%m-%d");
  return ddmmyyyy(dateStr)!;
};

const parseScale = (scale: string): number | string => {
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

function getDateRange(
  issuanceDate: string,
  parsedDate: Date
): { min: number; max: number } {
  if (RegExp(/^\d{4}$/).exec(issuanceDate)) {
    // yyyy: Limita all'intero anno
    const yearStart = new Date(parsedDate.getFullYear(), 0, 1).getTime();
    const yearEnd = new Date(parsedDate.getFullYear() + 1, 0, 1).getTime();
    return { min: yearStart, max: yearEnd };
  } else if (RegExp(/^\d{2}\/\d{4}$/).exec(issuanceDate)) {
    // mm/yyyy: Limita all'intero mese
    const monthStart = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      1
    ).getTime();
    const monthEnd = new Date(
      parsedDate.getFullYear(),
      parsedDate.getMonth() + 1,
      1
    ).getTime();
    return { min: monthStart, max: monthEnd };
  } else {
    // Altri formati (dd/mm/yyyy o invalidi): Nessun range
    return { min: parsedDate.getTime(), max: parsedDate.getTime() };
  }
}

const fetchDocuments = async (): Promise<Node[]> => {
  const response = await API.getDocuments();
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
    parsedDate: parseDate(doc.parsedDate.split("T")[0]),
    pages: doc.pages,
    language: doc.language,
    zoneID: doc.zoneID,
  }));
};

interface userProps {
  userInfo: { username: string; role: string } | null;
}

export const Diagram: React.FC<userProps> = ({ userInfo }) => {
  const location = useLocation();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isZoomEnabled, setIsZoomEnabled] = useState(false);
  const zoomBehavior = useRef<d3.ZoomBehavior<Element, unknown> | null>(null); // Ref per il comportamento dello zoom

  useEffect(() => {
    if (location.state?.selectedDocument) {
      setIsZoomEnabled(true);
      const document = location.state.selectedDocument;
      setSelectedDocument(document);
    }
  }, [location.state]);

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

    const margin = { top: 20, right: 300, bottom: 200, left: 100 };

    const newYDomain = new Set([
      "Concept",
      "Text",
      ...[...new Set(nodes.map((node: Node) => node.parsedScale))].sort(
        (a, b) => {
          // Se entrambi sono "Blueprints/effects", mettili alla fine
          if (a === "Blueprints/effects") return 1;
          if (b === "Blueprints/effects") return -1;

          // Ordina numericamente in ordine decrescente
          if (typeof a === "number" && typeof b === "number") {
            return b - a;
          }

          // Se uno è un numero e l'altro è una stringa, metti il numero prima
          if (typeof a === "number") return -1;
          if (typeof b === "number") return 1;

          // Se entrambi sono stringhe, ordina alfabeticamente (decrescente)
          return String(b).localeCompare(String(a));
        }
      ),
      "Blueprints/effects",
      "",
    ]);

    const newXDomain = [
      d3.timeYear.offset(
        d3.min(nodes.map((node: Node) => node.parsedDate))!,
        -1
      ), // domain 1 year before the min date
      d3.timeYear.offset(
        d3.max(nodes.map((node: Node) => node.parsedDate))!,
        1
      ), // domain 1 year after the max date
    ];

    const numberOfYears = d3.timeYear.count(newXDomain[0], newXDomain[1]);

    const width = Math.max(window.innerWidth, numberOfYears * 150);
    const height = Math.max(window.innerHeight, newYDomain.size * 125);

    const yScale = d3
      .scalePoint()
      .domain(newYDomain as Iterable<string>)
      .range([margin.top, height - margin.bottom]);

    const xScale = d3
      .scaleTime()
      .domain(newXDomain as Iterable<Date>)
      .range([margin.left, width - margin.right]);

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#f9f9f9");

    const currentTransform = d3.zoomTransform(svg.node());

    svg.selectAll("*").remove();

    // Creazione del gruppo radice per lo zoom
    const rootGroup = svg.append("g").attr("class", "root-group");

    // Add grid
    const gridGroup = rootGroup
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left + 225}, 0)`);

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
    const xTicks = xScale.ticks(20);
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
    const legendGroup = rootGroup
      .append("g")
      .attr("transform", `translate(${margin.left - 75}, ${margin.top})`);

    let currentY = 0;

    // Node types
    legendGroup
      .append("text")
      .text("Node types:")
      .attr("x", 0)
      .attr("y", 5)
      .attr("font-size", 20)
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
          .attr("x", 275)
          .attr("y", 5)
          .attr("font-size", 15)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end");

        legendItem
          .append("g")
          .html(ReactDOMServer.renderToStaticMarkup(item.icon))
          .attr("transform", `translate(285, -5)`);

        currentY += 25; // Update Y position for next item
      });

    currentY += 25;

    // Stakeholders
    legendGroup
      .append("text")
      .text("Stakeholders:")
      .attr("x", 0)
      .attr("y", currentY + 5)
      .attr("font-size", 20)
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
          .attr("x", 275)
          .attr("y", 5)
          .attr("font-size", 15)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end");

        legendItem
          .append("rect")
          .attr("x", 285)
          .attr("y", -5)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", item.color!);

        currentY += 25;
      });

    currentY += 25;

    // Connections
    legendGroup
      .append("text")
      .text("Connections:")
      .attr("x", 0)
      .attr("y", currentY + 5)
      .attr("font-size", 20)
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
          .attr("x", 275)
          .attr("y", 5)
          .attr("font-size", 15)
          .attr("alignment-baseline", "middle")
          .attr("text-anchor", "end");

        legendItem
          .append("line")
          .attr("x1", 285)
          .attr("x2", 320)
          .attr("y1", 5)
          .attr("y2", 5)
          .attr("stroke", "black")
          .attr("stroke-width", 2)
          .attr(
            "stroke-dasharray",
            item.lineStyle === "solid" ? "" : item.lineStyle!
          );

        currentY += 25;
      });

    const graphGroup = rootGroup
      .append("g")
      .attr("transform", `translate(${margin.left + 225}, 0)`);

    //Asse X
    graphGroup
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(20))
      .attr("font-size", "12px");

    //Asse Y
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

    // Crea la simulazione della forza per posizionare i nodi
    const simulation = d3
      .forceSimulation(nodeData)
      .force("x", d3.forceX((d) => xScale(d.parsedDate)).strength(1)) // Forza verso la posizione x basata su xScale
      .force("y", d3.forceY((d) => yScale(d.parsedScale)).strength(1)) // Forza verso la posizione y basata su yScale
      .force(
        "collision",
        d3.forceCollide(25) // Distanza minima tra i nodi (raggio di collisione)
      )
      .stop(); // Ferma la simulazione inizialmente

    // Esegui la simulazione per un determinato numero di iterazioni
    for (let i = 0; i < 250; ++i) simulation.tick();

    // Disegna i link tra i nodi
    const seenLinks = new Set();

    graphGroup
      .append("g")
      .selectAll("path")
      .data(
        nodeData.flatMap((sourceNode) =>
          sourceNode.links
            .map((link, index) => ({
              id: link.linkID,
              sourceNode,
              targetNode: nodeData.find((node) => node.id === link.documentID),
              relationship: link.relationship,
              index,
            }))
            .filter(({ sourceNode, targetNode, relationship }) => {
              if (targetNode) {
                const linkKey = [sourceNode.id, targetNode.id, relationship]
                  .sort((a, b) => {
                    // If both are numbers, sort numerically
                    if (typeof a === "number" && typeof b === "number") {
                      return a - b;
                    }

                    // If both are strings, sort lexicographically
                    if (typeof a === "string" && typeof b === "string") {
                      return a.localeCompare(b);
                    }

                    // Handle mixed types (numbers first)
                    return typeof a === "number" ? -1 : 1;
                  })
                  .join("-");
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
          const startX = sourceNode.x;
          const startY = sourceNode.y;
          const endX = targetNode.x;
          const endY = targetNode.y;

          const controlX = (startX + endX) / 2;
          const controlY = (startY + endY) / 2 - 50 - index * 50;

          return `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`;
        }
        return "";
      })
      .attr("class", "my-line")
      .attr("stroke", "black")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("stroke-dasharray", ({ relationship }) =>
        getLineStyle(relationship)
      )
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("stroke", "blue") // Change line color
          .attr("stroke-width", 4); // Make the line thicker
        // Create a tooltip container dynamically
        const tooltipContainer = document.createElement("div");
        tooltipContainer.id = "tooltip-container";
        tooltipContainer.style.position = "absolute";
        tooltipContainer.style.left = `${event.pageX + 10}px`; // Add offset for better visibility
        tooltipContainer.style.top = `${event.pageY + 10}px`;
        tooltipContainer.style.background = "rgba(0, 0, 0, 0.8)";
        tooltipContainer.style.color = "#fff";
        tooltipContainer.style.padding = "8px 12px";
        tooltipContainer.style.borderRadius = "4px";
        tooltipContainer.style.fontSize = "12px";
        tooltipContainer.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.3)";
        tooltipContainer.style.pointerEvents = "none"; // Prevent interaction
        tooltipContainer.style.zIndex = "1000";

        // Add text to the tooltip
        tooltipContainer.innerText = `Connection Type: ${d.relationship}`;

        // Append the tooltip to the body
        document.body.appendChild(tooltipContainer);
      })
      .on("mousemove", function (event) {
        // Dynamically update the tooltip position as the mouse moves
        const tooltip = document.getElementById("tooltip-container");
        if (tooltip) {
          tooltip.style.left = `${event.pageX + 10}px`;
          tooltip.style.top = `${event.pageY + 10}px`;
        }
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("stroke", "black") // Reset line color
          .attr("stroke-width", 2); // Reset line width
        // Remove the tooltip when the mouse leaves the line
        const tooltip = document.getElementById("tooltip-container");
        if (tooltip) {
          document.body.removeChild(tooltip);
        }
      })

      .on("click", function (event, d) {
        if (userInfo?.role !== "Urban Planner") {
          alert("You do not have permission to update relationships.");
          return;
        }

        const dropdownContainer = document.createElement("div");
        dropdownContainer.id = "dropdown-container";
        dropdownContainer.style.position = "absolute";
        dropdownContainer.style.left = `${event.pageX}px`;
        dropdownContainer.style.top = `${event.pageY}px`;
        document.body.appendChild(dropdownContainer);

        const root = ReactDOM.createRoot(dropdownContainer);

        const onRelationshipChange = async (rel: string) => {
          try {
            d.relationship = rel;
            await API.updateLink(d.id, d.sourceNode.id, d.targetNode.id, rel);

            d3.select(this).attr("stroke-dasharray", getLineStyle(rel));

            alert("Relationship updated successfully!");
          } catch (error) {
            console.error("Failed to update relationship:", error);
            alert("An error occurred while updating the relationship.");
          } finally {
            root.unmount();
            document.body.removeChild(dropdownContainer);
          }
        };

        root.render(
          <Dropdown show={true}>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Update Relationship
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {[
                "Direct consequence",
                "Collateral consequence",
                "Projection",
                "Update",
              ].map((rel) => (
                <Dropdown.Item
                  key={rel}
                  onClick={() => onRelationshipChange(rel)}
                >
                  {rel}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        );

        const removeDropdown = () => {
          if (document.body.contains(dropdownContainer)) {
            root.unmount();
            document.body.removeChild(dropdownContainer);
            document.removeEventListener("click", removeDropdown);
          }
        };

        setTimeout(
          () => document.addEventListener("click", removeDropdown),
          10
        );
      });

    const drag = d3
      .drag()
      .on("start", function (event, d) {
        simulation.alphaTarget(0.3);
        d3.select(this).raise().classed("active", true);
        d.initialY = d.y;
      })
      .on("drag", function (event, d) {
        const { min, max } = getDateRange(d.issuanceDate, d.parsedDate);
        const yMin = d.initialY - 10; // Limite inferiore per Y (5 pixel sopra)
        const yMax = d.initialY + 10;
        if (min !== max) {
          const newX = d.x + event.dx;
          const newY = d.y + event.dy;
          d.x = Math.min(Math.max(newX, xScale(min)), xScale(max));
          d.y = Math.min(Math.max(newY, yMin), yMax);
          d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);
        }
      })
      .on("end", function (event, d) {
        simulation.alphaTarget(0).restart();
        d3.select(this).classed("active", false);
      });

    // Disegna i nodi
    const nodes_diag: any = graphGroup
      .selectAll("g.node")
      .data(nodeData)
      .join("g")
      .attr("class", "node")
      .attr(
        "transform",
        (d) => `translate(${d.x}, ${d.y})` // Usa le coordinate calcolate dalla simulazione
      )
      .each(function (d) {
        const node = d3.select(this);

        node
          .append("foreignObject")
          .attr("x", -20)
          .attr("y", -20)
          .attr("width", 50)
          .attr("height", 50)
          .html(
            (d) =>
              `<div class="${
                selectedDocument?.id === d.id
                  ? "custom-icon highlighted"
                  : "custom-icon"
              }">
        ${ReactDOMServer.renderToStaticMarkup(
          <d.iconComponent
            width="25px"
            height="25px"
            color={getColor(d.stakeholders)}
          />
        )}
      </div>`
          );
        node
          .append("rect")
          .attr("x", -20)
          .attr("y", -20)
          .attr("width", 40)
          .attr("height", 40)
          .attr("fill", "transparent");

        node
          .append("text")
          .attr("x", 0)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .attr("font-size", 10)
          .style("visibility", "hidden")
          .text(d.title);

        node
          .on("mouseover", function () {
            d3.select(this).select("text").style("visibility", "visible");
          })
          .on("mouseout", function () {
            d3.select(this).select("text").style("visibility", "hidden");
          })
          .on("click", function (event, d) {
            setSelectedDocument(d);
          });
      });

    nodes_diag.call(drag);

    simulation.nodes(nodeData).on("tick", function () {
      nodes_diag.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
    });

    // aggiungi funzionalità di zoom
    const offset = 50;

    const zoom = d3
      .zoom()
      .scaleExtent([0.75, 10])
      .translateExtent([
        [0, 0],
        [width + offset, height + offset],
      ]) // Limita la traslazione all'interno del grafico
      .on("zoom", (event) => {
        rootGroup.attr("transform", event.transform);
      });

    zoomBehavior.current = zoom; // Salva il comportamento dello zoom nella ref

    // Applica o rimuovi lo zoom in base allo stato
    if (isZoomEnabled) {
      svg.call(zoomBehavior.current); // Attach zoom behavior
      svg.call(zoomBehavior.current.transform, currentTransform); // Reapply saved transform
    } else {
      svg.on(".zoom", null); // Remove zoom behavior
    }

    return () => {
      svg.on(".zoom", null); // Pulisce lo zoom quando il componente si smonta
    };
  }, [nodes, isZoomEnabled, selectedDocument]);

  // Funzione per lo zoom in
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehavior.current || !isZoomEnabled) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehavior.current.scaleBy, 1.5);
  };

  // Funzione per lo zoom out
  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehavior.current || !isZoomEnabled) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehavior.current.scaleBy, 0.75);
  };

  return (
    <>
      <ButtonGroup className="mb-3">
        <Button
          variant={isZoomEnabled ? "outline-secondary" : "outline-light"}
          onClick={() => setIsZoomEnabled(!isZoomEnabled)}
        >
          {isZoomEnabled ? "Disable Zoom" : "Enable Zoom"}
        </Button>
        <Button
          variant="outline-primary"
          onClick={handleZoomIn}
          disabled={!isZoomEnabled}
        >
          Zoom In
        </Button>
        <Button
          variant="outline-danger"
          onClick={handleZoomOut}
          disabled={!isZoomEnabled}
        >
          Zoom Out
        </Button>
      </ButtonGroup>
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
