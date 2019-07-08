
import React from 'react'
import { Autocomplete } from '@react-google-maps/api';


const MapAutoComplete = () => {
    return (
        <div>
            <Autocomplete>
            <input
              type="text"
              placeholder="Search The MOBB"
              className="App-Autocomplete"
            />
            </Autocomplete>
        </div>
    )
}

export default MapAutoComplete