const express = require('express')
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require('../db')
const slugify = require('slugify')

router.get('/', async (req, res) => {
    const results = await db.query(
        'SELECT * FROM companies')
    return res.json(results.rows)
})

router.get('/:code', async (req, res) => {
    const results = await db.query(
        `SELECT id.field, c.name, c.code, c.description FROM industries AS id
        LEFT JOIN comp_ind AS ci 
        ON id.ind_code=ci.ind_code
        LEFT JOIN companies AS c
        ON ci.comp_code = c.code WHERE c.code=$1`,
        [req.params.code])
    const invresults = await db.query(`SELECT id, amt, paid FROM invoices WHERE comp_code=$1`, [req.params.code])
    let invoices = []
    invresults.rows.forEach(r => {
        let { id, amt, paid } = r
        invoices.push({ id, amt, paid })
    })
    let industries = []
    results.rows.forEach(ind => {
        let { field } = ind
        industries.push(field)
    })
    const { code, name, description } = results.rows[0]
    return res.json({ company: { code, name, description, industries, invoices } })
})

router.post('/', async (req, res, next) => {
    try {
        let { code, name, description } = req.body
        if (!code) {
            code = slugify(name, { lower: true })
        }
        const results = await db.query(
            `INSERT INTO companies (code,name,description) VALUES ($1,$2,$3)
             RETURNING code, name, description`,
            [code, name, description])
        return res.status(201).json({ company: results.rows })
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
    } catch (err) {
        return next(err)
    }
})

router.delete('/:code', async (req, res) => {
    const result = await db.query(
        'DELETE FROM companies WHERE code=$1',
        [req.params.code])
    return res.json({ status: "Deleted" })
})


//Creates listing in comp_ind table
router.post('/industry', async (req, res, next) => {
    console.log(req.body)
    try {
        let { comp_code, ind_code } = req.body
        console.log(comp_code,ind_code)
        const results = await db.query(
            `INSERT INTO comp_ind (comp_code, ind_code) VALUES ($1,$2)`
            [comp_code, ind_code])
        console.log(results.rows)
        return res.status(201).json({ company: results.rows })
    } catch (err) {
        return next(err)
    }
})


module.exports = router