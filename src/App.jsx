/*
    Cost Manager Front End
    Final Project in Front-End Development

    App.jsx - the main component of the application. This component opens
    the database, retrieves the currency exchange rates from the server
    side, and shows the screens of the application.
*/

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import SavingsIcon from '@mui/icons-material/Savings';

import { openCostsDB, getExchangeRates } from './lib/db.js';
import { fetchExchangeRates, getRatesUrl } from './lib/exchangeRates.js';
import { DATABASE_NAME, DATABASE_VERSION } from './lib/constants.js';
import AddCostForm from './components/AddCostForm.jsx';
import ReportView from './components/ReportView.jsx';
import PieChartView from './components/PieChartView.jsx';
import BarChartView from './components/BarChartView.jsx';
import SettingsView from './components/SettingsView.jsx';

export default function App() {
    // the database is opened once, when the application starts
    const database = useMemo(function () {
        return openCostsDB(DATABASE_NAME, DATABASE_VERSION);
    }, []);

    const [tab, setTab] = useState(0);
    const [rates, setRates] = useState(getExchangeRates());
    const [ratesStatus, setRatesStatus] = useState('loading');
    const [ratesMessage, setRatesMessage] = useState('');
    /*
        The following number is increased whenever the data changes (a cost
        item was added or removed, or new exchange rates were retrieved).
        The components that show reports recalculate them when it changes.
    */
    const [version, setVersion] = useState(0);
    const [notification, setNotification] = useState(null);

    // increases the number that causes the reports to be recalculated
    const refresh = useCallback(function () {
        setVersion(function (previous) {
            return previous + 1;
        });
    }, []);

    // shows a message at the bottom of the screen
    const notify = useCallback(function (message, severity) {
        setNotification({ message: message, severity: severity || 'success' });
    }, []);

    /*
        Retrieves the exchange rates from the server side. The application
        keeps working with the rates it already has when the retrieval fails.
    */
    const loadRates = useCallback(async function (url, silent) {
        setRatesStatus('loading');
        try {
            const updated = await fetchExchangeRates(url);
            setRates(updated);
            setRatesStatus('ready');
            setRatesMessage('');
            refresh();
            if (!silent) {
                notify('the exchange rates were retrieved successfully', 'success');
            }
            return updated;
        } catch (exception) {
            setRatesStatus('error');
            setRatesMessage(exception.message);
            setRates(getExchangeRates());
            refresh();
            if (!silent) {
                notify('the exchange rates couldn\'t be retrieved: ' + exception.message, 'error');
            }
            throw exception;
        }
    }, [notify, refresh]);

    // retrieving the exchange rates when the application starts
    useEffect(function () {
        loadRates(getRatesUrl(), true).catch(function () {
            // the default rates are used when the retrieval fails
        });
    }, [loadRates]);

    // the description of the chip that shows the status of the rates
    const ratesChip = {
        loading: { label: 'loading rates...', color: 'default' },
        ready: { label: 'rates: USD 1 = ILS ' + rates.ILS, color: 'success' },
        error: { label: 'using default rates', color: 'warning' }
    }[ratesStatus];

    const screens = [
        <AddCostForm key="add" database={database} onCostAdded={refresh} notify={notify} />,
        <ReportView key="report" database={database} version={version} onCostDeleted={refresh} notify={notify} />,
        <PieChartView key="pie" database={database} version={version} />,
        <BarChartView key="bar" database={database} version={version} />,
        <SettingsView
            key="settings"
            rates={rates}
            ratesStatus={ratesStatus}
            ratesMessage={ratesMessage}
            onReloadRates={loadRates}
            notify={notify}
        />
    ];

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', pb: 6 }}>
            <AppBar position="static">
                <Toolbar>
                    <SavingsIcon sx={{ mr: 1.5 }} />
                    <Typography variant="h6" component="h1" sx={{ flexGrow: 1, fontWeight: 500 }}>
                        Cost Manager
                    </Typography>
                    <Tooltip title={ratesStatus === 'error' ? ratesMessage : 'the exchange rates in use'}>
                        <Chip
                            size="small"
                            label={ratesChip.label}
                            color={ratesChip.color}
                            sx={{ backgroundColor: ratesStatus === 'loading' ? 'rgba(255,255,255,0.25)' : undefined, color: '#fff' }}
                        />
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 3 }}>
                <Paper elevation={2} sx={{ mb: 3 }}>
                    <Tabs
                        value={tab}
                        onChange={function (event, value) {
                            setTab(value);
                        }}
                        variant="fullWidth"
                        textColor="primary"
                        indicatorColor="primary"
                    >
                        <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Add Cost" />
                        <Tab icon={<DescriptionIcon />} iconPosition="start" label="Report" />
                        <Tab icon={<PieChartIcon />} iconPosition="start" label="Pie Chart" />
                        <Tab icon={<BarChartIcon />} iconPosition="start" label="Bar Chart" />
                        <Tab icon={<SettingsIcon />} iconPosition="start" label="Settings" />
                    </Tabs>
                </Paper>

                {screens[tab]}
            </Container>

            <Snackbar
                open={notification !== null}
                autoHideDuration={5000}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                onClose={function () {
                    setNotification(null);
                }}
            >
                <Alert
                    severity={notification ? notification.severity : 'success'}
                    variant="filled"
                    onClose={function () {
                        setNotification(null);
                    }}
                >
                    {notification ? notification.message : ''}
                </Alert>
            </Snackbar>
        </Box>
    );
}
