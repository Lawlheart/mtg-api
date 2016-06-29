import { Router } from 'express';
import facets from './api/facets';
import cards from './api/card';

export default function() {
  var api = Router();

  // mount the facets resource
  api.use('/facets', facets);
  api.use('/cards', cards);

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({
      version : '1.0'
    });
  });

  return api;
}
