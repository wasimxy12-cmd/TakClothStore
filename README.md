# Tak Cloth Store

This storefront now uses a Vercel backend with Subspace inventory support.

## What is included
- A public storefront in [index.html](index.html)
- A Vercel serverless backend under [api/](api/)
- Admin and login pages that are ready for future UI integration
- Backend auth, product inventory, and upload logic with Subspace configuration

## Backend endpoints
- POST /api/auth — admin login, returns a bearer token
- GET /api/auth — verify an existing token
- GET /api/products — retrieve the current inventory
- PUT /api/products — update inventory (requires auth)
- POST /api/upload — upload assets to Subspace (requires auth)

## Deployment
1. Push the repository to GitHub.
2. Create a Vercel project from this repo.
3. Add environment variables in the Vercel project settings.
4. Deploy.

## Environment configuration
Copy .env.example to .env and set your own values.

Required variables:

- ADMIN_USERNAME
- ADMIN_PASSWORD
- AUTH_SECRET
- WEB_ORIGIN
- SUBSPACE_API_URL
- SUBSPACE_API_KEY
- SUBSPACE_INVENTORY_PATH
- SUBSPACE_UPLOAD_PATH

## Updating content
- The storefront now fetches inventory from /api/products.
- To change inventory, update Subspace data through PUT /api/products or extend the admin UI.
