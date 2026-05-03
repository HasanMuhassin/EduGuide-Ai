const express = require('express');
const router = express.Router();
const { getCourses, addCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

router.get('/', getCourses);
router.post('/', addCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
