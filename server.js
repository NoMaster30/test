// server.js
export default {
    async fetch(request, env) {
      const url = new URL(request.url);
      const API_BASE = 'https://api.sellauth.com/v1';
  
      // 1. Gérer le CORS (Autoriser le frontend à parler au backend)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      }
  
      // 2. Proxy vers l'API Sellauth
      if (url.pathname.startsWith('/api/')) {
        const endpoint = url.pathname.replace('/api/', '');
        const token = request.headers.get('authorization');
  
        if (!token) {
          return new Response(JSON.stringify({ error: "Token manquant" }), { 
            status: 401, 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
          });
        }
  
        try {
          // On prépare le corps de la requête (sauf pour GET)
          const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text();
  
          // On transfère la requête à Sellauth
          const response = await fetch(`${API_BASE}/${endpoint}`, {
            method: request.method,
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Eternal-Panel-V2'
            },
            body: body
          });
  
          const data = await response.json();
  
          return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*' 
            }
          });
  
        } catch (error) {
          return new Response(JSON.stringify({ error: "Erreur Proxy API", details: error.message }), { 
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
          });
        }
      }
  
      // 3. Servir le Frontend (index.html)
      // Cela permet d'afficher votre site quand on va sur l'URL du worker
      return env.ASSETS.fetch(request);
    }
  };