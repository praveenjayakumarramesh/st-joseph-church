const express = require('express');
const router = express.Router();
const Designation = require('../models/Designation');
const auth = require('../middleware/auth');

// Get all designations
router.get('/', async (req, res) => {
  try {
    const designations = await Designation.find().sort({ name: 1 });
    res.json(designations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new designation
router.post('/', auth, async (req, res) => {
  try {
    const designation = new Designation(req.body);
    await designation.save();
    res.status(201).json(designation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update designation
router.put('/:id', auth, async (req, res) => {
  try {
    const designation = await Designation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.json(designation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete designation
router.delete('/:id', auth, async (req, res) => {
  try {
    const designation = await Designation.findByIdAndDelete(req.params.id);
    if (!designation) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.json({ message: 'Designation deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 