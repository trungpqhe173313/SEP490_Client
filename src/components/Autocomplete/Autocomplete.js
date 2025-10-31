import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import React from 'react';

export function AutocompleteCommon({ loading, value, onSelect, onSearch, options, disableClearable, error, getOptionLabel }) {

    const onChange = (event, newValue) => {
        onSelect(newValue);
    }

    const onChangeTextSearch = (event) => {
        event.target.value.length > 3 && onSearch(event.target.value);
    }

    return (
        <div>
            <Autocomplete
                fullWidth
                disableClearable={disableClearable}
                options={options}
                value={value}
                onChange={(e, data) => onChange(e, data)}
                getOptionLabel={getOptionLabel}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        onChange={onChangeTextSearch}
                        error={error}
                        className='bg-white'
                    />
                )}
            />
            {loading && <CircularProgress style={{ width: '24px', height: '24px' }} />}
        </div>
    )
}