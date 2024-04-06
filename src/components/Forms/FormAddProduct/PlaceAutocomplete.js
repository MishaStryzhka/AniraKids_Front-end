import React, { useRef, useEffect, useState } from 'react';
import { Map, Marker, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Field, LabelDescription, WrapMap } from './FormAddProduct.styled';
import MapHandler from './MapHandler';

const PlaceAutocomplete = ({
  value = {
    geoCode: { lat: -6.8694342, lng: 107.5932621 },
  },
  name = 'adress',
  onPlaceSelect,
  disabled = false,
  placeholder = 'address',
}) => {
  const [inputValue, setInputValue] = useState(value?.formatted_address);

  const [place, setPlace] = useState(value);

  const inputRef = useRef();

  const [placeAutocomplete, setPlaceAutocomplete] = useState();
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
      setPlace(placeAutocomplete.getPlace());
      setInputValue(placeAutocomplete.getPlace().formatted_address);
    });
  }, [onPlaceSelect, placeAutocomplete]);

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
          setPlace(adress);
          onPlaceSelect(adress);
          setInputValue(adress.formatted_address);
        } else {
          console.error('No results found');
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  };

  return (
    <>
      <LabelDescription className="autocomplete-container">
        <Field
          ref={inputRef}
          placeholder={placeholder}
          type="adress"
          name={name}
          value={inputValue}
          onChange={e => setInputValue(e.currentTarget.value)}
          disabled={disabled}
        />
      </LabelDescription>

      {place && (
        <WrapMap>
          <Map
            defaultCenter={{ lat: 50.074465122666346, lng: 14.434535050418326 }}
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
        </WrapMap>
      )}
    </>
  );
};

export default PlaceAutocomplete;
