const express = require('express')
const router = new express.Router();
const ExpressError = require("../expressError")
const db = require('../db')

router.get("/", async(req,res,next)=>{
    try{
        
        const results = await db.query(
            `SELECT id.field, c.name FROM industries AS id
            LEFT JOIN comp_ind AS ci 
            ON id.ind_code=ci.ind_code
            LEFT JOIN companies AS c
            ON ci.comp_code = c.code`)
        console.log(results.rows)
        res.json(results.rows)
        }catch(err){
            return next(err)
        }

})

router.post("/", async(req,res,next)=>{
    try{
        const {ind_code, field}=req.body
        const results = await db.query(
            `INSERT INTO industries (ind_code, field) VALUES ($1,$2)
            RETURNING ind_code, field`,
            [ind_code, field])
        return res.status(201).json({industry:results.rows})
    }catch(err){
        return next(err)
    }
})

module.exports = router