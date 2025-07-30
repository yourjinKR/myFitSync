import React from 'react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

/** {lat : value, lng : value} 형태로 position 저장하여 맵 객체 생성 */
const BasicMap = ({position}) => {
    // 기본값: 서울시청
    const defaultPosition = {
        lat: 37.5665,
        lng: 126.9780,
    };

    const center = position || defaultPosition;

    return (
        <Map
        center={center}
        style={{ width: "100%", height: "100%" }}
        level={3}
        >
        <MapMarker position={center}/>
        </Map>
    );
};

export default BasicMap;