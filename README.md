# Real Estate Cluster Analysis & Visualization

A web application for visualizing and analyzing real estate properties using clustering techniques. Built with Next.js, TypeScript, and Leaflet for interactive mapping.

## Features

- **Interactive Map Visualization**: View property locations with custom cluster markers
- **Property Clustering**: Properties are grouped into clusters based on their characteristics
- **Advanced Filtering**:
  - Filter by cluster group
  - Price range filtering
  - Minimum bedroom requirements
- **Detailed Property Information**:
  - Property name and cluster assignment
  - Number of bedrooms and bathrooms
  - Floor count
  - Land and building area
  - Price information
  - Precise coordinates
- **CSV Data Import**: Upload your own property data in CSV format
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technical Stack

- **Frontend Framework**: Next.js with TypeScript
- **Mapping**: Leaflet.js with MarkerCluster
- **UI Components**: Custom components with Tailwind CSS
- **Data Processing**: PapaParse for CSV handling
- **State Management**: React Hooks

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Format

The application expects CSV data with the following columns:
- name: Property name
- url: Property URL
- bedrooms: Number of bedrooms
- bathrooms: Number of bathrooms
- floors: Number of floors
- land_area: Land area in square meters
- building_area: Building area in square meters
- longitude: Longitude coordinate
- latitude: Latitude coordinate
- price: Property price
- cluster: Cluster assignment (1-4)

## Features in Detail

### Map Visualization
- Interactive map with custom cluster markers
- Color-coded clusters for easy identification
- Smooth animations for property selection
- Responsive zoom and pan controls

### Filtering System
- Real-time filter updates
- Multiple filter criteria combination
- Easy filter reset functionality
- Visual cluster legend