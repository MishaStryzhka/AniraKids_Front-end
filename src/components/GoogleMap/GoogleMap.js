import { Map, Marker, useMapsLibrary } from '@vis.gl/react-google-maps';
import MapHandler from './MapHandler';

const GoogleMap = ({
  disabled,
  place,
  defaultCenter = { lat: 50.074465122666346, lng: 14.434535050418326 },
  createPlace,
}) => {
  const geocoding = useMapsLibrary('geocoding');

  const onClickMapCreatMarker = async e => {
    const geocoder = new geocoding.Geocoder();

    const request = {
      location: e.detail.latLng,
    };

    geocoder.geocode(request, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          const { formatted_address, geometry, place_id } = results[0];
          const adress = { formatted_address, geometry, place_id };
          createPlace(adress);
        } else {
          console.error('No results found');
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  return (
    <Map
      defaultCenter={defaultCenter}
      defaultZoom={11}
      gestureHandling={'greedy'}
      disableDefaultUI={true}
      onClick={e => {
        !disabled && onClickMapCreatMarker(e);
      }}
    >
      {/* <AdvancedMarker
    position={{ lat: 30, lng: 10 }}
    title={'AdvancedMarker with custom html content.'}
  >
    <div
      style={{
        width: 16,
        height: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        background: '#1dbe80',
        border: '2px solid #0e6443',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    ></div>
  </AdvancedMarker> */}
      <Marker
        position={place?.geometry?.location}
        title={place?.formatted_address}
      />

      <MapHandler place={place} />
    </Map>
  );
};

export default GoogleMap;
