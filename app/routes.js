import { Router } from 'express';
import block from './api/block';
import card from './api/card';
import deck from './api/deck';

export default function() {
  var api = Router();

  // mount the facets resource
  api.use('/blocks', block);
  api.use('/cards', card);
  api.use('/decks', deck);

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({
      version : '1.0'
    });
  });

  return api;
}
