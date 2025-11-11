import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import React from 'react';

export function AutocompleteCommon({ loading, value, onSelect, onSearch, options, disableClearable, error, getOptionLabel, getOptionKey }) {

    const onChange = (event, newValue) => {
        onSelect(newValue);
    }

    const onChangeTextSearch = (event) => {
        onSearch(event.target.value);
    }

    return (
        <div className='flex flex-row'>
            <Autocomplete
                size='small'
                fullWidth
                disableClearable={disableClearable}
                options={options}
                value={value}
                onChange={onChange}
                getOptionLabel={getOptionLabel}
                getOptionKey={getOptionKey}
                clearOnBlur
                clearOnEscape
                blurOnSelect
                key={value ? value[getOptionKey] : 'empty'}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        onChange={onChangeTextSearch}
                        error={error}
                        sx={{ zIndex: 0, backgroundColor: 'white' }}
                    />
                )}
            />
            {loading && <CircularProgress style={{ width: '24px', height: '24px' }} />}
        </div>
    )
}