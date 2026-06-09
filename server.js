const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors());
app.use(express.json());

const CU      = 'https://api.clickup.com/api/v2';
const TOKEN   = 'pk_84198557_25C10VCV5M5HY7WEXFVBPJ83A6X11EKA';
const LIST_ID = '901327024344';
const DISCORD = 'https://discord.com/api/webhooks/1513914304980717658/gxLzxckcc_Xe_WtPjJvmfDSaJA-9TWIDyRS6OIwkwoxSDk9ntRxVEiRaoxUJGrlz2jjr';
const ROLE_ID = '1430186316619841687';

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
    const task = await r.json();
    res.json(task);

    if (task.id) {
      const em  = { urgent:'🚨', high:'🔴', normal:'🟡', low:'🟢' };
      const tm  = { BUG:'🐛', Melhoria:'✨', Task:'📋', 'Integração':'🔗', Outro:'📌' };
      const prioMap = {'1':'urgent','2':'high','3':'normal','4':'low'};
      const prioKey = prioMap[task.priority?.priority] || 'normal';
      const isUrgent = prioKey === 'urgent';

      const desc = task.description || '';
      const clientMatch = desc.match(/\*\*Cliente:\*\* ([^\n]+)/);
      const typeMatch   = desc.match(/\*\*Tipo:\*\* ([^\n]+)/);
      const csMatch     = desc.match(/\*\*CS:\*\* ([^\n]+)/);
      const client = clientMatch ? clientMatch[1] : '';
      const type   = typeMatch   ? typeMatch[1]   : 'Outro';
      const cs     = csMatch     ? csMatch[1]     : '–';

      const payload = {
        content: isUrgent ? `<@&${ROLE_ID}> 🚨 Novo ticket urgente!` : '',
        embeds: [{
          title: `${tm[type]||'📌'} ${task.name}`,
          color: isUrgent ? 15548997 : prioKey==='high' ? 16027660 : 3428330,
          fields: [
            { name: 'Tipo',           value: type,  inline: true },
            { name: 'Prioridade',     value: `${em[prioKey]||'🟡'} ${prioKey.toUpperCase()}`, inline: true },
            { name: 'Responsável CS', value: cs,    inline: true },
            ...(task.url ? [{ name: 'Link', value: `[Ver no ClickUp](${task.url})` }] : [])
          ],
          footer:    { text: 'Bondy CS · Central de Tickets' },
          timestamp: new Date().toISOString()
        }]
      };

      fetch(DISCORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.error('Discord error:', e.message));
    }
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/user', async (req, res) => {
  try {
    const r = await fetch(`${CU}/user`, { headers: { Authorization: TOKEN } });
    res.json(await r.json());
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/discord/test', async (req, res) => {
  try {
    const r = await fetch(DISCORD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '✅ **Bondy CS** conectado! Notificações aparecerão aqui. 🎉' })
    });
    res.json({ status: r.status, ok: r.status === 204 });
  } catch(e) { res.status(500).json({ err: e.message }); }
});

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'Bondy CS Proxy' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bondy proxy running on port ${PORT}`));
