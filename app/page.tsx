"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Papa from "papaparse"
import { Upload, Filter, MapPin, Home, Currency } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import("./components/SimpleMapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
})

export interface PropertyData {
  name: string
  url: string
  bedrooms: number
  bathrooms: number
  floors: number
  land_area: number
  building_area: number
  longitude: number
  latitude: number
  price: number
  cluster: number
}

// Utility to capitalize each word
function capitalizeWords(str: string) {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function RealEstateMap() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    cluster: "all",
    minPrice: "",
    maxPrice: "",
    minBedrooms: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load sample data on component mount
  useEffect(() => {
    loadSampleData()
  }, [])

  // Apply filters when properties or filters change
  useEffect(() => {
    applyFilters()
  }, [properties, filters])

  const loadSampleData = async () => {
    try {
      const response = await fetch("/sample_properties.csv")
      const csvText = await response.text()
      parseCSV(csvText)
    } catch (error) {
      console.error("Error loading sample data:", error)
      setLoading(false)
    }
  }

  const parseCSV = (csvText: string) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string) => {
        // Convert numeric fields
        if (["bedrooms", "bathrooms", "floors", "land_area", "building_area", "price", "cluster"].includes(field)) {
          return Number.parseFloat(value) || 0
        }
        if (["longitude", "latitude"].includes(field)) {
          return Number.parseFloat(value) || 0
        }
        return value
      },
      complete: (results: any) => {
        const data = results.data as PropertyData[]
        setProperties(data)
        setLoading(false)
      },
      error: (error: any) => {
        console.error("CSV parsing error:", error)
        setLoading(false)
      },
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setLoading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvText = e.target?.result as string
        parseCSV(csvText)
      }
      reader.readAsText(file)
    }
  }

  const applyFilters = () => {
    let filtered = [...properties]

    // Filter by cluster
    if (filters.cluster !== "all") {
      filtered = filtered.filter((p) => p.cluster === Number.parseInt(filters.cluster))
    }

    // Filter by price range
    if (filters.minPrice) {
      filtered = filtered.filter((p) => p.price >= Number.parseFloat(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number.parseFloat(filters.maxPrice))
    }

    // Filter by minimum bedrooms
    if (filters.minBedrooms) {
      filtered = filtered.filter((p) => p.bedrooms >= Number.parseInt(filters.minBedrooms))
    }

    setFilteredProperties(filtered)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getClusterColor = (cluster: number) => {
    const colors = {
      1: "#ef4444", // red
      2: "#3b82f6", // blue
      3: "#10b981", // green
      4: "#f59e0b", // yellow
    }
    return colors[cluster as keyof typeof colors] || "#6b7280"
  }

  const resetFilters = () => {
    setFilters({
      cluster: "all",
      minPrice: "",
      maxPrice: "",
      minBedrooms: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real estate data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Real Estate Cluster</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/cluster-analysis"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 4-4h6" /><path d="M9 7V5a4 4 0 0 1 4-4h6" /></svg>
                Analisis Kluster
              </a>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </Button>
                <Input
                  ref={fileInputRef}
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div className="text-sm text-gray-600">
                {filteredProperties.length} of {properties.length} properties
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row">
        {/* Left Panel: Property Details Only */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6 p-4 bg-white/30 border-r h-full overflow-y-auto">
          {/* Property Details */}
          <Card className="p-6 bg-white/30 border-0">
            <CardHeader>
              <CardTitle className="flex flex-col items-center gap-2">
                <span className="text-l font-extrabold text-blue-900 tracking-tight text-center">
                  {capitalizeWords(selectedProperty?.name || "")}
                </span>
                {selectedProperty && (
                  <span
                    className="mt-2 px-4 py-1 rounded-full text-xs font-semibold shadow-md transition-transform duration-200 hover:scale-105"
                    style={{ backgroundColor: getClusterColor(selectedProperty.cluster), color: '#fff' }}
                  >
                    Cluster {selectedProperty.cluster}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedProperty ? (
                <div className="space-y-7">
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 21V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" /><circle cx="12" cy="16" r="4" /></svg>
                      </div>
                      <span>{selectedProperty.bedrooms} Kamar Tidur</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21V8a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v13" /><rect x="7" y="4" width="10" height="4" rx="2" /></svg>
                      </div>
                      <span>{selectedProperty.bathrooms} Kamar Mandi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14" /><rect x="7" y="10" width="10" height="4" rx="2" /></svg>
                      </div>
                      <span>{selectedProperty.floors} Lantai</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="7" height="7" rx="2" /><rect x="14" y="11" width="7" height="7" rx="2" /></svg>
                      </div>
                      <span>{selectedProperty.land_area} m² Tanah</span>
                    </div>
                    <div className="flex items-center gap-3 col-span-2">
                      <div className="bg-blue-100 text-blue-600 rounded-full p-2 shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="7" rx="2" /></svg>
                      </div>
                      <span>{selectedProperty.building_area} m² Bangunan</span>
                    </div>
                  </div>
                  {/* Price */}
                  <div className="pt-6 border-t border-gray-200/60 mt-6">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-700 font-bold">Harga:</span>
                    </div>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent tracking-tight">
                      {formatPrice(selectedProperty.price)}
                    </p>
                  </div>
                  {/* Coordinates */}
                  <div className="pt-6 border-t border-gray-200/60">
                    <span className="text-gray-500 font-bold">Koordinat: </span>
                    <p className="text-sm font-mono text-blue-900">
                      {selectedProperty.latitude.toFixed(6)}, {selectedProperty.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-10 flex flex-col items-center">
                  <MapPin className="h-14 w-14 mb-4 text-gray-200" />
                  <p className="text-lg font-semibold">Klik pada marker untuk melihat detail properti</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Map with Filter Overlay */}
        <div className="flex-1 h-full relative">
          {/* Filter Panel Overlay */}
          <div className="fixed top-24 right-6 z-[1000] w-80 max-w-full">
            <Card className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-3xl border-0 p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 font-bold text-xl">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="cluster-filter" className="text-blue-800 font-semibold">Cluster</Label>
                  <Select
                    value={filters.cluster}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, cluster: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white/80 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400">
                      <SelectValue placeholder="All clusters" />
                    </SelectTrigger>
                    <SelectContent className="z-[1100]">
                      <SelectItem value="all">All Clusters</SelectItem>
                      <SelectItem value="1">Cluster 1</SelectItem>
                      <SelectItem value="2">Cluster 2</SelectItem>
                      <SelectItem value="3">Cluster 3</SelectItem>
                      <SelectItem value="4">Cluster 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="min-price" className="text-blue-800 font-semibold">Harga Minimal (IDR)</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                    className="mt-2 bg-white/80 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="max-price" className="text-blue-800 font-semibold">Harga Maksimal (IDR)</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder="No limit"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                    className="mt-2 bg-white/80 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <Label htmlFor="min-bedrooms" className="text-blue-800 font-semibold">Kamar Tidur Minimal</Label>
                  <Select
                    value={filters.minBedrooms}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, minBedrooms: value }))}
                  >
                    <SelectTrigger className="mt-2 bg-white/80 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="z-[1100]">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={resetFilters} variant="outline" className="w-full rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 font-semibold shadow hover:from-blue-200 hover:to-blue-300 transition">
                  Reset Filters
                </Button>

                {/* Cluster Legend */}
                <div className="pt-6 border-t border-gray-200/60">
                  <h4 className="font-medium mb-2 text-blue-900">Legenda Cluster</h4>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((cluster) => (
                      <div key={cluster} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow" style={{ backgroundColor: getClusterColor(cluster) }} />
                        <span className="text-sm text-blue-900">Cluster {cluster}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Map Area */}
          <div className="w-full h-full">
            <MapComponent
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
              getClusterColor={getClusterColor}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
