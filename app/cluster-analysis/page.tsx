"use client"

import React, { useEffect, useState } from "react"
import Papa from "papaparse"
import { Bar, Pie, Scatter } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    ArcElement,
} from "chart.js"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, ArcElement)

const MapComponent = dynamic(() => import("../components/SimpleMapComponent"), { ssr: false })

const CLUSTER_COLORS: Record<number, string> = {
    1: "#ef4444",
    2: "#3b82f6",
    3: "#10b981",
    4: "#f59e0b",
}

export default function ClusterAnalysisPage() {
    const router = useRouter()
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/sample_properties.csv")
            .then((res) => res.text())
            .then((csv) => {
                Papa.parse(csv, {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    complete: (results: any) => {
                        setData(results.data)
                        setLoading(false)
                    },
                })
            })
    }, [])

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    // Helper: group by cluster
    const clusters = [1, 2, 3, 4]
    const clusterCounts = clusters.map((c) => data.filter((d) => d.cluster === c).length)

    // Helper: get numeric array for a field, filter out NaN/empty
    const getNumeric = (field: string) => data.map((d) => Number(d[field])).filter((v) => !isNaN(v))

    // Chart data
    const clusterPie = {
        labels: clusters.map((c) => `Cluster ${c}`),
        datasets: [
            {
                data: clusterCounts,
                backgroundColor: clusters.map((c) => CLUSTER_COLORS[Number(c)]),
            },
        ],
    }

    const priceBar = {
        labels: clusters.map((c) => `Cluster ${c}`),
        datasets: [
            {
                label: "Rata-rata Harga (IDR)",
                data: clusters.map((c) => {
                    const arr = data.filter((d) => d.cluster === c).map((d) => Number(d.price)).filter((v) => !isNaN(v))
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
                }),
                backgroundColor: clusters.map((c) => CLUSTER_COLORS[Number(c)]),
            },
        ],
    }

    const landBar = {
        labels: clusters.map((c) => `Cluster ${c}`),
        datasets: [
            {
                label: "Rata-rata Luas Tanah (m²)",
                data: clusters.map((c) => {
                    const arr = data.filter((d) => d.cluster === c).map((d) => Number(d.land_area)).filter((v) => !isNaN(v))
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
                }),
                backgroundColor: clusters.map((c) => CLUSTER_COLORS[Number(c)]),
            },
        ],
    }

    const buildingBar = {
        labels: clusters.map((c) => `Cluster ${c}`),
        datasets: [
            {
                label: "Rata-rata Luas Bangunan (m²)",
                data: clusters.map((c) => {
                    const arr = data.filter((d) => d.cluster === c).map((d) => Number(d.building_area)).filter((v) => !isNaN(v))
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
                }),
                backgroundColor: clusters.map((c) => CLUSTER_COLORS[Number(c)]),
            },
        ],
    }

    const bedroomBar = {
        labels: clusters.map((c) => `Cluster ${c}`),
        datasets: [
            {
                label: "Rata-rata Kamar Tidur",
                data: clusters.map((c) => {
                    const arr = data.filter((d) => d.cluster === c).map((d) => Number(d.bedrooms)).filter((v) => !isNaN(v))
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
                }),
                backgroundColor: clusters.map((c) => CLUSTER_COLORS[Number(c)]),
            },
        ],
    }

    const bathroomBar = {
        labels: clusters.map((c) => `Cluster ${c}`),
        datasets: [
            {
                label: "Rata-rata Kamar Mandi",
                data: clusters.map((c) => {
                    const arr = data.filter((d) => d.cluster === c).map((d) => Number(d.bathrooms)).filter((v) => !isNaN(v))
                    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
                }),
                backgroundColor: clusters.map((c) => CLUSTER_COLORS[Number(c)]),
            },
        ],
    }

    // Scatter for price vs land_area
    const scatterPriceLand = {
        datasets: [
            {
                label: "Harga vs Luas Tanah",
                data: data.map((d) => ({
                    x: Number(d.land_area),
                    y: Number(d.price),
                    cluster: d.cluster,
                })).filter((d) => !isNaN(d.x) && !isNaN(d.y)),
                backgroundColor: data.map((d) => CLUSTER_COLORS[Number(d.cluster)] || "#6b7280"),
                pointRadius: 4,
            },
        ],
    }

    // Map data
    const validProperties = data.filter(
        (d) =>
            d &&
            d.latitude !== undefined &&
            d.longitude !== undefined &&
            typeof d.latitude === "number" &&
            typeof d.longitude === "number" &&
            !isNaN(d.latitude) &&
            !isNaN(d.longitude)
    )
    const mapProps = {
        properties: validProperties,
        selectedProperty: null,
        onPropertySelect: () => { },
        getClusterColor: (cluster: number) => CLUSTER_COLORS[Number(cluster)] || "#6b7280",
        className: "w-full h-[400px] rounded-xl border mb-8",
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-5xl mx-auto space-y-10">
                <button
                    onClick={() => router.back()}
                    className="flex items-center border border-blue-500 text-blue-700 px-4 py-2 rounded-lg mb-6 hover:bg-blue-50 transition"
                >
                    <span className="mr-2">←</span> Kembali
                </button>
                <h2 className="text-3xl font-bold text-blue-900 mb-2">Analisis Kluster Properti</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Distribusi Properti per Cluster</h3>
                        <Pie data={clusterPie} />
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Rata-rata Harga per Cluster</h3>
                        <Bar data={priceBar} />
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Rata-rata Luas Tanah per Cluster</h3>
                        <Bar data={landBar} />
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Rata-rata Luas Bangunan per Cluster</h3>
                        <Bar data={buildingBar} />
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Rata-rata Kamar Tidur per Cluster</h3>
                        <Bar data={bedroomBar} />
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <h3 className="font-semibold mb-4">Rata-rata Kamar Mandi per Cluster</h3>
                        <Bar data={bathroomBar} />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6 mt-8">
                    <h3 className="font-semibold mb-4">Sebaran Harga vs Luas Tanah</h3>
                    <Scatter data={scatterPriceLand} options={{ scales: { x: { title: { display: true, text: 'Luas Tanah (m²)' } }, y: { title: { display: true, text: 'Harga (IDR)' } } } }} />
                </div>
            </div>
        </div>
    )
} 