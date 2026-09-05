/*
    Cost Manager Front End
    Final Project in Front-End Development

    PieChartView.jsx - the screen that shows a pie chart with the total
    costs of a selected month and year, according to the categories, and in
    the currency the user selects.
*/

import React, { useMemo, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { CHART_COLORS, getMonthName } from '../lib/constants.js';
import { CurrencySelect, MonthSelect, YearSelect } from './Selectors.jsx';

export default function PieChartView({ database, version }) {
    const now = new Date();
    const [currency, setCurrency] = useState('USD');
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);

    // the total costs of each one of the categories, in the selected currency
    const data = useMemo(function () {
        return database.getCategoriesReport(currency, year, month);
    }, [database, currency, year, month, version]);

    /*
        The total costs of the selected month, taken from the report itself,
        so that the total shown here is identical to the one the detailed
        report shows.
    */
    const total = useMemo(function () {
        return database.getReport(currency, year, month).total.sum;
    }, [database, currency, year, month, version]);

    return (
        <Card elevation={2}>
            <CardHeader
                title="Costs According to Categories"
                subheader={'the costs of ' + getMonthName(month) + ' ' + year + ', in ' + currency}
            />
            <Divider />
            <CardContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <MonthSelect value={month} onChange={setMonth} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <YearSelect value={year} onChange={setYear} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CurrencySelect value={currency} onChange={setCurrency} label="Chart Currency" />
                    </Grid>
                </Grid>

                {data.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            There are no cost items in {getMonthName(month)} {year}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ height: 420 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="sum"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={140}
                                    isAnimationActive={false}
                                    label={function (slice) {
                                        const percent = total === 0 ? 0 : Math.round((slice.sum / total) * 100);
                                        return slice.category + ' ' + percent + '%';
                                    }}
                                >
                                    {data.map(function (item, index) {
                                        return (
                                            <Cell
                                                key={item.category}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip
                                    formatter={function (value) {
                                        return currency + ' ' + value;
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                )}

                {data.length > 0 && (
                    <Typography variant="subtitle1" align="center" sx={{ mt: 2, fontWeight: 700 }}>
                        Total: {currency} {total}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
