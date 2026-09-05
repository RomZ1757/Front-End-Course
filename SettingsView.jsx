/*
    Cost Manager Front End
    Final Project in Front-End Development

    SettingsView.jsx - the screen that allows the user to specify the URL
    address from which the currency exchange rates are retrieved. When the
    user doesn't specify a URL address, the application retrieves the rates
    from the static JSON file that is deployed together with it.
*/

import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';

import { SUPPORTED_CURRENCIES } from '../lib/db.js';
import { getRatesUrl, setRatesUrl, getDefaultRatesUrl, hasCustomRatesUrl } from '../lib/exchangeRates.js';

export default function SettingsView({ rates, ratesStatus, ratesMessage, onReloadRates, notify }) {
    const [url, setUrl] = useState(hasCustomRatesUrl() ? getRatesUrl() : '');

    // keeps the URL address the user typed in and retrieves the rates from it
    function handleSave() {
        try {
            setRatesUrl(url);
            notify('the URL address was saved', 'success');
            onReloadRates(getRatesUrl()).catch(function () {
                // the message of the failure is shown by the App component
            });
        } catch (exception) {
            notify(exception.message, 'error');
        }
    }

    // removes the URL address the user specified and uses the default one
    function handleReset() {
        try {
            setRatesUrl('');
            setUrl('');
            notify('the default URL address is used again', 'info');
            onReloadRates(getDefaultRatesUrl()).catch(function () {
                // the message of the failure is shown by the App component
            });
        } catch (exception) {
            notify(exception.message, 'error');
        }
    }

    return (
        <Card elevation={2}>
            <CardHeader
                title="Settings"
                subheader="the URL address from which the currency exchange rates are retrieved"
            />
            <Divider />
            <CardContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                    The reply of the URL address you specify should be a JSON with the following structure:
                    <Box component="code" sx={{ display: 'block', mt: 1, fontFamily: 'monospace' }}>
                        {'{"USD":1, "GBP":0.6, "EURO":0.7, "ILS":3.4}'}
                    </Box>
                    Every rate describes how many units of that currency are equivalent to USD 1.
                </Alert>

                <TextField
                    fullWidth
                    label="Exchange Rates URL"
                    placeholder={getDefaultRatesUrl()}
                    value={url}
                    helperText={
                        'leave this field empty in order to use the default URL address: ' + getDefaultRatesUrl()
                    }
                    onChange={function (event) {
                        setUrl(event.target.value);
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>
                        Save and Load
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={function () {
                            onReloadRates(getRatesUrl()).catch(function () {
                                // the message of the failure is shown by the App component
                            });
                        }}
                    >
                        Load Again
                    </Button>
                    <Button variant="text" startIcon={<SettingsBackupRestoreIcon />} onClick={handleReset}>
                        Use The Default URL
                    </Button>
                </Box>

                <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
                    The Exchange Rates in Use
                </Typography>

                {ratesStatus === 'loading' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2">retrieving the exchange rates...</Typography>
                    </Box>
                )}

                {ratesStatus === 'error' && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        The exchange rates couldn&apos;t be retrieved ({ratesMessage}). The application works with
                        the default rates it includes.
                    </Alert>
                )}

                {ratesStatus === 'ready' && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        The exchange rates were retrieved from {getRatesUrl()}
                    </Alert>
                )}

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Currency</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell>Meaning</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {SUPPORTED_CURRENCIES.map(function (currency) {
                            return (
                                <TableRow key={currency}>
                                    <TableCell>{currency}</TableCell>
                                    <TableCell align="right">{rates[currency]}</TableCell>
                                    <TableCell>
                                        {currency} {rates[currency]} = USD 1
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
