"use client"

import { useState, useEffect, useRef } from "react"
import type { PropertyData } from "../page"

interface SimpleMapComponentProps {
  properties: PropertyData[]
  selectedProperty: PropertyData | null
  onPropertySelect: (property: PropertyData) => void
  getClusterColor: (cluster: number) => string
  className?: string
}

export default function SimpleMapComponent({
  properties,
  selectedProperty,
  onPropertySelect,
  getClusterColor,
  className,
}: SimpleMapComponentProps) {
  const [map, setMap] = useState<any>(null)
  const [leaflet, setLeaflet] = useState<any>(null)
  const mapRef = useRef<any>(null)
  const clusterGroupRef = useRef<any>(null)

  // Dynamically import leaflet and markercluster
  useEffect(() => {
    const initMap = async () => {
      try {
        await import("leaflet")
        await import("leaflet.markercluster")
        const leafletInstance = window.L
        setLeaflet(leafletInstance)

        // Remove any existing map instance and clear the container
        if (mapRef.current) {
          mapRef.current.remove()
          mapRef.current = null
        }
        const mapContainer = document.getElementById("map")
        if (mapContainer) {
          mapContainer.innerHTML = ""
        }

        // Create map
        const mapInstance = leafletInstance.map("map").setView([-6.9502023, 107.53771], 9)

        // Add tile layer
        leafletInstance.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance)

        setMap(mapInstance)
        mapRef.current = mapInstance
      } catch (error) {
        console.error("Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      const mapContainer = document.getElementById("map")
      if (mapContainer) {
        mapContainer.innerHTML = ""
      }
    }
  }, [])

  // Add markers with clustering
  useEffect(() => {
    if (!map || !leaflet || !properties.length) return

    // Remove previous cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current)
      clusterGroupRef.current = null
    }

    // Create cluster group
    const markerClusterGroup = leaflet.markerClusterGroup()

    properties.forEach((property) => {
      const color = getClusterColor(property.cluster)
      const isSelected = selectedProperty?.name === property.name
      const size = isSelected ? 35 : 25

      const customIcon = leaflet.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isSelected ? "14px" : "12px"};
            transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
            transition: all 0.2s ease;
          ">
            ${property.cluster}
          </div>
        `,
        className: "custom-marker",
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      })

      const marker = leaflet
        .marker([property.latitude, property.longitude], { icon: customIcon })
        .bindPopup(
          `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-semibold text-lg mb-2">${property.name}</h3>
            <div class="text-sm">
              <p><span class="font-medium">Cluster:</span> ${property.cluster}</p>
            </div>
          </div>
        `,
        )
        .on("click", () => onPropertySelect(property))

      markerClusterGroup.addLayer(marker)
    })

    markerClusterGroup.addTo(map)
    clusterGroupRef.current = markerClusterGroup
  }, [map, leaflet, properties, selectedProperty, getClusterColor, onPropertySelect])

  // Fit bounds only when properties change
  // useEffect(() => {
  //   if (!map || !leaflet || !properties.length) return
  //   const markerLayers = clusterGroupRef.current?.getLayers?.() || []
  //   if (markerLayers.length > 0) {
  //     const group = leaflet.featureGroup(markerLayers)
  //     map.fitBounds(group.getBounds().pad(0.1))
  //   }
  // }, [map, leaflet, properties])

  // Pan/zoom to selected property only when it changes
  useEffect(() => {
    if (!map || !leaflet || !selectedProperty) return
    map.setView([selectedProperty.latitude, selectedProperty.longitude], Math.max(map.getZoom(), 16), {
      animate: true,
    })
  }, [map, leaflet, selectedProperty])

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"
      />
      <div id="map" className={`${className || "w-full h-full"} z-0`} />
    </>
  )
}
