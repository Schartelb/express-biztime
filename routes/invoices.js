const express = require('express');
const app = require('../app');
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require('../db')

router.get('/', async (req, res) => {
    const results = await db.query(
        'SELECT * FROM invoices')
    return res.json({ invoices: results.rows })
})
router.get('/:id', async (req, res) => {
    const results = await db.query(
        'SELECT * FROM invoices WHERE id=$1',
        [req.params.id])
    return res.json({ invoices: results.rows })
})

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body
        const results = await db.query(
            `INSERT INTO invoices (comp_code, amt) VALUES ($1,$2) RETURNING 
            id,comp_code, amt,paid, add_date, paid_date`,
            [comp_code, amt])
        return res.status(201).json({ invoices: results.rows })
    } catch (err) {
        return next(err)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
        let today
        const { amt, paid} = req.body
        if (paid) {
            today = new Date().toLocaleDateString()
        }else{
            today = null
        }

        const results = await db.query(
            `UPDATE invoices SET amt=$1,paid=$2, paid_date=$3
             WHERE id=$4 RETURNING
             id,comp_code, amt,paid, add_date, paid_date`,
            [amt, paid, today, req.params.id])

        if (results.rows.length === 0) {
            res.status(404).json({ message: `No invoice found with id ${req.params.id}` })
        }
        return res.json({ invoice: results.rows[0] })
    } catch (err) {
        return next(err)
    }
})

router.delete('/:id', async (req, res) => {
    const result = await db.query(
        'DELETE FROM invoices WHERE id=$1',
        [req.params.id])
    return res.json({ status: "Deleted" })
})

module.exports = router