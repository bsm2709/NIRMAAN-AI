import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import 'leaflet/dist/leaflet.css';
import './ProjectMap.css';

// Fix for default marker icon issue in React Leaflet
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ProjectMap = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Default center coordinates (can be set to a specific city or region)
  const defaultCenter = [20.5937, 78.9629]; // Center of India
  const defaultZoom = 5;

  useEffect(() => {
    // Fetch projects with location data
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/projects/public');
        setProjects(response.data.filter(project => project.latitude && project.longitude));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleMarkerClick = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Custom marker icons based on project status
  const getMarkerIcon = (status) => {
    // You can customize this to use different icons based on project status
    return defaultIcon;
  };

  if (loading) return <div className="map-loading">Loading map data...</div>;
  if (error) return <div className="map-error">{error}</div>;

  return (
    <div className="map-container">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {projects.map(project => (
          <Marker 
            key={project.id}
            position={[project.latitude, project.longitude]}
            icon={getMarkerIcon(project.status)}
            eventHandlers={{
              click: () => handleMarkerClick(project.id)
            }}
          >
            <Popup>
              <div className="project-popup">
                <h3>{project.name}</h3>
                <p><strong>Status:</strong> {project.status}</p>
                <p><strong>Progress:</strong> {project.progress}%</p>
                {project.delay_status && (
                  <p className="delay-status"><strong>Delay:</strong> {project.delay_status}</p>
                )}
                <button 
                  className="view-details-btn"
                  onClick={() => handleMarkerClick(project.id)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ProjectMap;