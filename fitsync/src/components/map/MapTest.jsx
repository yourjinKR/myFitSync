import React from 'react';
import { Map, MapMarker } from "react-kakao-maps-sdk";
import styled from 'styled-components';

export const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 10px;
`;

const MapTest = ({ position }) => {
    const center = {
    lat: position.lat ?? 37.5665,
    lng: position.lng ?? 126.9780,
  };
  
  return (
    <Map
      center={center}
      style={{ width: "100%", height: "100%" }}
      level={3}
      draggable={false}
    >
      <MapMarker position={center}/>
    </Map>
  );
};

export default MapTest;
