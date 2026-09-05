/*
    Cost Manager Front End
    Final Project in Front-End Development

    ReportView.jsx - the screen that shows a detailed report for a specific
    month and year, in the currency the user selects. Every cost item is
    shown with the currency in which it was added, next to its value in the
    currency of the report.
*/

import React, { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { convert } from '../lib/db.js';
import { getMonthName } from '../lib/constants.js';
import { CurrencySelect, MonthSelect, YearSelect } from './Selectors.jsx';

// rounds the given number to two digits after the decimal point
function round(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export default function ReportView({ database, version, onCostDeleted, notify }) {
    const now = new Date();
    const [currency, setCurrency] = useState('USD');
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    /*
        The report is created again whenever the user selects a different
        month, year or currency, and whenever the data changes.
    */
    const report = useMemo(function () {
        return database.getReport(currency, year, month);
    }, [database, currency, year, month, version]);

    /*
        The cost items that belong to the selected month and year, including
        the identifier of each one of them. The identifier allows removing a
        cost item, and it is not a part of the report the db library returns.
    */
    const items = useMemo(function () {
        return database.getAllCosts().filter(function (item) {
            return item.date.year === year && item.date.month === month;
        });
    }, [database, year, month, version]);

    // removes the cost item with the given identifier
    function handleDelete(item) {
        try {
            database.deleteCost(item.id);
            onCostDeleted();
            notify('the cost item ' + item.description + ' was removed', 'info');
        } catch (exception) {
            notify('the cost item couldn\'t be removed: ' + exception.message, 'error');
        }
    }

    return (
        <Card elevation={2}>
            <CardHeader
                title="Detailed Report"
                subheader={'the costs of ' + getMonthName(month) + ' ' + year + ', in ' + currency}
            />
            <Divider />
            <CardContent>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <MonthSelect value={month} onChange={setMonth} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <YearSelect value={year} onChange={setYear} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CurrencySelect value={currency} onChange={setCurrency} label="Report Currency" />
                    </Grid>
                </Grid>

                {report.costs.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            There are no cost items in {getMonthName(month)} {year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You can add cost items in the Add Cost screen.
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="medium">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Day</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Original Sum</TableCell>
                                    <TableCell align="right">Sum in {currency}</TableCell>
                                    <TableCell align="center">Remove</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {report.costs.map(function (cost, index) {
                                    const converted = round(convert(cost.sum, cost.currency, currency));
                                    return (
                                        <TableRow key={items[index] ? items[index].id : index} hover>
                                            <TableCell>{cost.date.day}</TableCell>
                                            <TableCell>
                                                <Chip label={cost.category} size="small" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{cost.description}</TableCell>
                                            <TableCell align="right">
                                                {cost.currency} {cost.sum}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 500 }}>
                                                {currency} {converted}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="remove this cost item">
                                                    <IconButton
                                                        size="small"
                                                        color="secondary"
                                                        disabled={!items[index]}
                                                        onClick={function () {
                                                            handleDelete(items[index]);
                                                        }}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ border: 0 }} />
                                    <TableCell align="right" sx={{ border: 0 }}>
                                        <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 700 }}>
                                            Total: {report.total.currency} {report.total.sum}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ border: 0 }} />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                )}
            </CardContent>
        </Card>
    );
}
