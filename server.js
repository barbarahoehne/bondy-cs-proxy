const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors());
app.use(express.json());

const CU = 'https://api.clickup.com/api/v2';

function getToken(req) {
  return req.headers['x-token'] || req.headers['authorization'] || '';
}

app.get('/tasks/:listId', async (req, res) => {
  try {
    const token = getToken(req);
    const r = await fetch(`${CU}/list/${req.params.listId}/task?include_closed=true`, {
      headers: { Authorization: token }
    });
    const d = await r.json();
    res.json(d);
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.post('/tasks/:listId', async (req, res) => {
  try {
    const token = getToken(req);
    const r = await fetch(`${CU}/list/${req.params.listId}/task`, {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const d = await r.json();
    res.json(d);
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/user', async (req, res) => {
  try {
    const token = getToken(req);
    const r = await fetch(`${CU}/user`, { headers: { Authorization: token } });
    const d = await r.json();
    res.json(d);
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Bondy CS Proxy' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bondy proxy running on port ${PORT}`));
