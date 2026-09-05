/*
    Cost Manager Front End
    Final Project in Front-End Development

    BarChartView.jsx - the screen that shows a bar chart with the total
    costs of each one of the twelve months in a year the user selects, and
    in the currency the user selects.
*/

import React, { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { MONTH_NAMES } from '../lib/constants.js';
import { CurrencySelect, YearSelect } from './Selectors.jsx';

export default function BarChartView({ database, version }) {
    const now = new Date();
    const [currency, setCurrency] = useState('USD');
    const [year, setYear] = useState(now.getFullYear());

    /*
        The total costs of each one of the twelve months of the selected
        year, in the selected currency. The name of every month is added,
        so that the chart can show it below its bar.
    */
    const data = useMemo(function () {
        return database.getYearlyReport(currency, year).map(function (item) {
            return {
                month: MONTH_NAMES[item.month - 1].slice(0, 3),
                sum: item.sum
            };
        });
    }, [database, currency, year, version]);

    // the total costs of the entire year
    const total = Math.round((data.reduce(function (sum, item) {
        return sum + item.sum;
    }, 0) + Number.EPSILON) * 100) / 100;

    return (
        <Card elevation={2}>
            <CardHeader
                title="Costs in Each One of The Months"
                subheader={'the costs of the twelve months of ' + year + ', in ' + currency}
            />
            <Divider />
            <CardContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <YearSelect value={year} onChange={setYear} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <CurrencySelect value={currency} onChange={setCurrency} label="Chart Currency" />
                    </Grid>
                </Grid>

                <Box sx={{ height: 420 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip
                                formatter={function (value) {
                                    return currency + ' ' + value;
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="sum"
                                name={'total costs in ' + currency}
                                fill="#1976d2"
                                radius={[6, 6, 0, 0]}
                                isAnimationActive={false}
                                maxBarSize={64}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                <Typography variant="subtitle1" align="center" sx={{ mt: 2, fontWeight: 700 }}>
                    Total of {year}: {currency} {total}
                </Typography>
            </CardContent>
        </Card>
    );
}
