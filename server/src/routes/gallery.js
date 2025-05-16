const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');

// Get all gallery items
router.get('/', async (req, res) => {
  try {
    const galleryItems = await Gallery.find().sort({ date: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new gallery item
router.post('/', auth, async (req, res) => {
  try {
    const galleryItem = new Gallery(req.body);
    await galleryItem.save();
    res.status(201).json(galleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update gallery item
router.put('/:id', auth, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json(galleryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete gallery item
router.delete('/:id', auth, async (req, res) => {
  try {
    const galleryItem = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryItem) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 