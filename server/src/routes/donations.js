const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get all donations with filtering
router.get('/', async (req, res) => {
  try {
    console.log('Query params:', req.query);
    const { year, function: functionName } = req.query;
    let query = {};

    // Add year filter if provided
    if (year && year !== 'all') {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Add function filter if provided
    if (functionName && functionName !== 'all') {
      query.function = functionName;
    }

    console.log('MongoDB query:', query);
    const donations = await Donation.find(query).sort({ date: -1 });
    console.log('Found donations:', donations.length);

    // Calculate totals
    const totals = donations.reduce((acc, donation) => {
      if (donation.type === 'income') {
        acc.income += donation.amount;
      } else {
        acc.expenditure += donation.amount;
      }
      return acc;
    }, { income: 0, expenditure: 0 });

    totals.balance = totals.income - totals.expenditure;

    res.json({ donations, totals });
  } catch (error) {
    console.error('Error in GET /donations:', error);
    res.status(500).json({ message: 'Error fetching donations' });
  }
});

// Get all years with donations
router.get('/years', async (req, res) => {
  try {
    console.log('Fetching years');
    const donations = await Donation.find().sort({ date: -1 });
    const years = [...new Set(donations.map(d => new Date(d.date).getFullYear()))];
    console.log('Found years:', years);
    res.json(years);
  } catch (error) {
    console.error('Error in GET /years:', error);
    res.status(500).json({ message: 'Error fetching years' });
  }
});

// Get all functions
router.get('/functions', async (req, res) => {
  try {
    console.log('Fetching functions');
    const functions = await Donation.distinct('function');
    console.log('Found functions:', functions);
    res.json(functions);
  } catch (error) {
    console.error('Error in GET /functions:', error);
    res.status(500).json({ message: 'Error fetching functions' });
  }
});

// Add new donation
router.post('/', auth, async (req, res) => {
  try {
    console.log('Adding new donation:', req.body);
    const donation = new Donation({
      ...req.body,
      date: req.body.date || new Date()
    });
    await donation.save();
    console.log('Donation saved successfully');
    res.status(201).json(donation);
  } catch (error) {
    console.error('Error in POST /donations:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update donation
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating donation:', req.params.id, req.body);
    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    console.log('Donation updated successfully');
    res.json(donation);
  } catch (error) {
    console.error('Error in PUT /donations:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete donation
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting donation:', req.params.id);
    const donation = await Donation.findByIdAndDelete(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    console.log('Donation deleted successfully');
    res.json({ message: 'Donation deleted' });
  } catch (error) {
    console.error('Error in DELETE /donations:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 