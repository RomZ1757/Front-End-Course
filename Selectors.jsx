/*
    Cost Manager Front End
    Final Project in Front-End Development

    Selectors.jsx - the small components that allow the user to select a
    currency, a month and a year. These components are used by more than
    one screen of the application.
*/

import React from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

import { SUPPORTED_CURRENCIES } from '../lib/db.js';
import { MONTH_NAMES, getSelectableYears } from '../lib/constants.js';

// allows the user to select one of the currencies the application supports
export function CurrencySelect({ value, onChange, label }) {
    return (
        <TextField
            select
            fullWidth
            label={label || 'Currency'}
            value={value}
            onChange={function (event) {
                onChange(event.target.value);
            }}
        >
            {SUPPORTED_CURRENCIES.map(function (currency) {
                return (
                    <MenuItem key={currency} value={currency}>
                        {currency}
                    </MenuItem>
                );
            })}
        </TextField>
    );
}

// allows the user to select one of the twelve months
export function MonthSelect({ value, onChange }) {
    return (
        <TextField
            select
            fullWidth
            label="Month"
            value={value}
            onChange={function (event) {
                onChange(Number(event.target.value));
            }}
        >
            {MONTH_NAMES.map(function (name, index) {
                return (
                    <MenuItem key={name} value={index + 1}>
                        {name}
                    </MenuItem>
                );
            })}
        </TextField>
    );
}

// allows the user to select one of the recent years
export function YearSelect({ value, onChange }) {
    return (
        <TextField
            select
            fullWidth
            label="Year"
            value={value}
            onChange={function (event) {
                onChange(Number(event.target.value));
            }}
        >
            {getSelectableYears().map(function (year) {
                return (
                    <MenuItem key={year} value={year}>
                        {year}
                    </MenuItem>
                );
            })}
        </TextField>
    );
}
