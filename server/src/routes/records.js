const express = require('express');
const router = express.Router();
const Record = require('../models/Record');
const auth = require('../middleware/auth');

// Get all records with filtering
router.get('/', async (req, res) => {
  try {
    const { year, function: functionName, type } = req.query;
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

    // Add type filter if provided
    if (type && type !== 'all') {
      query.type = type;
    }

    const records = await Record.find(query).sort({ date: -1 });

    // Calculate totals
    const totals = records.reduce((acc, record) => {
      acc.income += record.amount;
      return acc;
    }, { income: 0, expenditure: 0, balance: 0 });

    totals.balance = totals.income - totals.expenditure;

    res.json({ records, totals });
  } catch (error) {
    console.error('Error in GET /records:', error);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Get all years with records
router.get('/years', async (req, res) => {
  try {
    console.log('Fetching years');
    const records = await Record.find().sort({ date: -1 });
    const years = [...new Set(records.map(d => new Date(d.date).getFullYear()))];
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
    const functions = await Record.distinct('function');
    console.log('Found functions:', functions);
    res.json(functions);
  } catch (error) {
    console.error('Error in GET /functions:', error);
    res.status(500).json({ message: 'Error fetching functions' });
  }
});

// Add new record
router.post('/', auth, async (req, res) => {
  try {
    console.log('Adding new record:', req.body);
    const record = new Record({
      ...req.body,
      date: req.body.date || new Date()
    });
    await record.save();
    console.log('Record saved successfully');
    res.status(201).json(record);
  } catch (error) {
    console.error('Error in POST /records:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update record
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating record:', req.params.id, req.body);
    const record = await Record.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    console.log('Record updated successfully');
    res.json(record);
  } catch (error) {
    console.error('Error in PUT /records:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete record
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting record:', req.params.id);
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    console.log('Record deleted successfully');
    res.json({ message: 'Record deleted' });
  } catch (error) {
    console.error('Error in DELETE /records:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add new route for yearly totals
router.get('/yearly-totals', async (req, res) => {
  try {
    const records = await Record.aggregate([
      {
        $group: {
          _id: { $year: '$date' },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          year: '$_id',
          total: 1,
          _id: 0
        }
      },
      {
        $sort: { year: 1 }
      }
    ]);

    res.json(records);
  } catch (error) {
    console.error('Error in GET /records/yearly-totals:', error);
    res.status(500).json({ message: 'Error fetching yearly totals' });
  }
});

module.exports = router;  