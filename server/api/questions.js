const router = require('express').Router()
const {Question, Test} = require('../db/models')
module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const questions = await Question.findAll({include: [Test]})
    res.json(questions)
  } catch (err) {
    next(err)
  }
})
