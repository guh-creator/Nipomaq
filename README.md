# Nipomaq — Frontend

Frontend inicial do sistema de automação de anúncios para marketplaces.

## Stack
- HTML5
- CSS3
- JavaScript puro
- Fetch API
- JSON

## Estrutura
- `index.html` — interface e páginas
- `style.css` — layout/responsividade/estilos
- `app.js` — estado, navegação, renderização e camada de API

## Rodar
Abra `index.html` no navegador. Para desenvolvimento, também pode usar Live Server no VS Code.

## Integração com o Backend
No início o projeto usa dados simulados:

```js
const API_BASE_URL = "http://localhost:3000/api";
const USE_MOCK = true;
```

Quando o Backend estiver pronto, altere `USE_MOCK` para `false` e ajuste `API_BASE_URL`.

O Frontend já está estruturado para enviar JSON por `fetch()`. Exemplo de payload de criação:

```json
{
  "product_id": 1,
  "marketplace": "Mercado Livre",
  "title": "Bomba Hidráulica 1/2 CV",
  "price": 489.90,
  "stock": 18,
  "description": "Produto Nipomaq."
}
```

Endpoint previsto:
`POST /api/ads`

A decisão de rotas e campos pode ser alterada quando o contrato da API do Backend for definido.
