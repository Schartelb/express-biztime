const express = require('express')
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require('../db')

router.get('/', async (req, res) => {
    const results = await db.query(
        'SELECT * FROM companies')
    return res.json(results.rows)
})

router.get('/:code', async (req, res) => {
    const results = await db.query(
        'SELECT * FROM companies c JOIN invoices i ON c.code=i.comp_code WHERE code=$1',
        [req.params.code])
    return res.json({company:results.rows})
})

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body
        const results = await db.query(
            `INSERT INTO companies (code,name,description) VALUES ($1,$2,$3) RETURNING comp, name, description`,
            [code, name, description])
        return res.status(201).json({company:results.rows})
    } catch (err) {
        return next(err)
    }
})

router.patch('/:code', async (req, res) => {
    try {
    const { name, description } = (req.body)
    const results = await db.query(
        'UPDATE companies SET name=$1,description=$2 WHERE code=$3 RETURNING code,name,description',
        [name, description, req.params.code])
    return res.json({ company: results.rows })
    }catch(err){
    return next(err)
    }
})

router.delete('/:code', async (req, res) => {
    const result = await db.query(
        'DELETE FROM companies WHERE code=$1',
        [req.params.code])
    return res.json({ status: "Deleted" })
})


module.exports = router