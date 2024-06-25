import React, { useRef, useEffect, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  Field,
  FieldMap,
  LabelDescription,
  WrapMap,
} from './FormAddProduct.styled';
import GoogleMap from 'components/GoogleMap/GoogleMap';
import { useAuth } from 'hooks';

const PlaceAutocomplete = ({
  value = {
    geoCode: { lat: -6.8694342, lng: 107.5932621 },
  },
  name = 'adress',
  onPlaceSelect,
  disabled = false,
  placeholder = 'address',
}) => {
  const { user } = useAuth();
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

  const createPlace = place => {
    setPlace(place);
    onPlaceSelect(place);
    setInputValue(place.formatted_address);
  };

  return (
    <>
      <LabelDescription className="autocomplete-container">
        <div style={{ position: 'relative' }}>
          <FieldMap
            ref={inputRef}
            placeholder={placeholder}
            type="adress"
            name={name}
            value={inputValue}
            onChange={e => setInputValue(e.currentTarget.value)}
            disabled={disabled}
            autoComplete={'false'}
          />
          <Field
            as="select"
            placeholder={placeholder}
            type="adress"
            name={name}
            // value={inputValue}
            onChange={({ currentTarget: { value } }) =>
              createPlace(
                user.pickupAddresses.find(adr => adr.place_id === value)
              )
            }
            disabled={disabled}
            autoComplete={'false'}
          >
            {user?.pickupAddresses?.map(adress => (
              <option key={adress.place_id} value={adress.place_id}>
                {adress.formatted_address}
              </option>
            ))}
          </Field>
        </div>
      </LabelDescription>

      {place && (
        <WrapMap>
          <GoogleMap
            place={place}
            createPlace={createPlace}
            disabled={disabled}
          />
        </WrapMap>
      )}
    </>
  );
};

export default PlaceAutocomplete;
