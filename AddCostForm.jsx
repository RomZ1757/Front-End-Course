/*
    Cost Manager Front End
    Final Project in Front-End Development

    AddCostForm.jsx - the screen that allows the user to add a new cost
    item. The user specifies the sum, the currency, the category and the
    description. The date that is attached to the new cost item is the
    date on which the cost item was added.
*/

import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import SaveIcon from '@mui/icons-material/Save';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { CATEGORIES } from '../lib/constants.js';
import { CurrencySelect } from './Selectors.jsx';

// the values of the form when it is empty
const EMPTY_FORM = { sum: '', currency: 'USD', category: 'Food', description: '' };

export default function AddCostForm({ database, onCostAdded, notify }) {
    const [values, setValues] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    // updates the value of one of the fields of the form
    function updateValue(name, value) {
        setValues(function (previous) {
            return Object.assign({}, previous, { [name]: value });
        });
        setErrors(function (previous) {
            return Object.assign({}, previous, { [name]: '' });
        });
    }

    /*
        Checks the values the user typed in and returns an object that holds
        the error message of every field that is not valid.
    */
    function validate() {
        const found = {};
        const sum = Number(values.sum);
        if (values.sum === '' || !isFinite(sum) || sum <= 0) {
            found.sum = 'the sum must be a number bigger than 0';
        }
        if (values.category.trim() === '') {
            found.category = 'the category is required';
        }
        if (values.description.trim() === '') {
            found.description = 'the description is required';
        }
        return found;
    }

    // adds the new cost item to the database
    function handleSubmit(event) {
        event.preventDefault();
        const found = validate();
        if (Object.keys(found).length > 0) {
            setErrors(found);
            return;
        }
        try {
            const added = database.addCost({
                sum: Number(values.sum),
                currency: values.currency,
                category: values.category,
                description: values.description
            });
            setValues(EMPTY_FORM);
            setErrors({});
            onCostAdded();
            notify('the cost item ' + added.description + ' (' + added.currency + ' ' + added.sum + ') was added', 'success');
        } catch (exception) {
            notify('the cost item couldn\'t be added: ' + exception.message, 'error');
        }
    }

    // the date that will be attached to the new cost item
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    return (
        <Card elevation={2}>
            <CardHeader
                title="Add a New Cost Item"
                subheader={'the date that will be attached to this cost item is ' + today}
            />
            <Divider />
            <CardContent>
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="Sum"
                                value={values.sum}
                                error={Boolean(errors.sum)}
                                helperText={errors.sum || ' '}
                                inputProps={{ min: 0, step: '0.01' }}
                                onChange={function (event) {
                                    updateValue('sum', event.target.value);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <CurrencySelect
                                value={values.currency}
                                onChange={function (currency) {
                                    updateValue('currency', currency);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                required
                                label="Category"
                                value={values.category}
                                error={Boolean(errors.category)}
                                helperText={errors.category || ' '}
                                onChange={function (event) {
                                    updateValue('category', event.target.value);
                                }}
                            >
                                {CATEGORIES.map(function (category) {
                                    return (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    );
                                })}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                required
                                label="Description"
                                value={values.description}
                                error={Boolean(errors.description)}
                                helperText={errors.description || ' '}
                                onChange={function (event) {
                                    updateValue('description', event.target.value);
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />}>
                            Add Cost
                        </Button>
                        <Button
                            type="button"
                            variant="outlined"
                            size="large"
                            startIcon={<RestartAltIcon />}
                            onClick={function () {
                                setValues(EMPTY_FORM);
                                setErrors({});
                            }}
                        >
                            Clear
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        Every cost item is saved in the local storage together with the currency in which it was
                        added. The original currency is kept, and the reports and the charts convert the sums
                        into the currency you select.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
