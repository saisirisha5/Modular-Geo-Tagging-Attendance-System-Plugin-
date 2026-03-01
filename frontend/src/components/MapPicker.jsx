import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapPicker = ({ onLocationSelect , initialLocation}) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [80.6348, 16.5238],
      zoom: 13
    });

    mapRef.current = map;

    if (initialLocation) {
      const marker = new mapboxgl.Marker()
        .setLngLat([initialLocation.lng, initialLocation.lat])
        .addTo(map);

      markerRef.current = marker;
    }
    
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);

      onLocationSelect({ lat, lng });
    });

    setTimeout(() => {
      map.resize();
    }, 500);

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '450px'
      }}
    />
  );
};

export default MapPicker;