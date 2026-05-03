const { dbService } = require('../services/dbService');

const getCourses = async (req, res) => {
  try {
    const courses = await dbService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const addCourse = async (req, res) => {
  try {
    const course = await dbService.addCourse(req.body);
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add course' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const course = await dbService.updateCourse(req.params.id, req.body);
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    await dbService.deleteCourse(req.params.id);
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

module.exports = { getCourses, addCourse, updateCourse, deleteCourse };
