const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors());
app.use(express.json());

const CU    = 'https://api.clickup.com/api/v2';
const TOKEN = 'pk_84198557_25C10VCV5M5HY7WEXFVBPJ83A6X11EKA';

app.get('/tasks/:listId', async (req, res) => {
  try {
    const r = await fetch(`${CU}/list/${req.params.listId}/task?include_closed=true`, {
      headers: { Authorization: TOKEN }
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.post('/tasks/:listId', async (req, res) => {
  try {
    const r = await fetch(`${CU}/list/${req.params.listId}/task`, {
      method: 'POST',
      headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/user', async (req, res) => {
  try {
    const r = await fetch(`${CU}/user`, { headers: { Authorization: TOKEN } });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.post('/discord', async (req, res) => {
  try {
    const { webhookUrl, payload } = req.body;
    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      return res.status(400).json({ err: 'Invalid webhook URL' });
    }
    const r = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    res.status(r.status).json({ status: r.status, body: text });
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Bondy CS Proxy' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bondy proxy running on port ${PORT}`));
