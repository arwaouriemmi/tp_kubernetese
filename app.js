const { Registry, collectDefaultMetrics, Counter } = require('prom-client');
const express = require('express');

// Créer un registre pour contenir les métriques
const registry = new Registry();

// Activer les métriques par défaut comme l'utilisation du CPU, l'utilisation de la mémoire, etc.
collectDefaultMetrics({ register: registry });

// Créer un compteur pour suivre le nombre de requêtes
const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Nombre total de requêtes HTTP',
  registers: [registry],
  labelNames: ['method', 'path', 'status'],
});

// Créer une application express
const app = express();

// Définir une route pour incrémenter le compteur de requêtes
app.get('/', (req, res) => {
  // Enregistrer la requête dans les logs
  console.log(`[${new Date().toISOString()}] Received ${req.method} request for ${req.path}`);
  
  // Incrémenter le compteur de requêtes
  requestCounter.labels(req.method, req.path, res.statusCode.toString()).inc();
  
  // Répondre avec un message
  res.send('Hello World !');
});

// Exposer les métriques pour que Prometheus les récupère
app.get('/metrics', async (req, res) => {
  const result = await registry.metrics();
  res.send(result);
});

// Démarrer le serveur
const port = 3000;
app.listen(port, () => {
  console.log(`Serveur à l'écoute sur le port ${port}`);
});


