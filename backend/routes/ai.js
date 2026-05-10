const express = require('express');
const fetch = require('node-fetch');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/ai/generate — proxy to manim service
router.post('/generate', protect, async (req, res) => {
  const { prompt, type } = req.body;
  if (!prompt || !type) {
    return res.status(400).json({ message: 'prompt and type are required' });
  }

  const manimUrl = process.env.MANIM_SERVICE_URL || 'http://localhost:5001';

  try {
    const response = await fetch(`${manimUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type }),
      timeout: 120000,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ message: 'Manim service error' }));
      return res.status(response.status).json(errData);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    if (err.type === 'request-timeout' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        message: 'AI generation service is unavailable. Please ensure the manim-service is running.',
      });
    }
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ai/health — check manim service status
router.get('/health', protect, async (req, res) => {
  const manimUrl = process.env.MANIM_SERVICE_URL || 'http://localhost:5001';
  try {
    const response = await fetch(`${manimUrl}/health`, { timeout: 5000 });
    const data = await response.json();
    res.json({ status: 'ok', manimService: data });
  } catch {
    res.json({ status: 'ok', manimService: { status: 'unavailable' } });
  }
});

module.exports = router;
