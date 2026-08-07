# Tak Cloth Store

This storefront now uses a Vercel backend with Supabase inventory support.

## What is included
- A public storefront in [index.html](index.html)
- A Vercel serverless backend under [api/](api/)
- Admin and login pages that are ready for future UI integration
- Backend auth, product inventory, and upload logic with Supabase configuration

## Backend endpoints
- POST /api/auth — admin login, returns a bearer token
- GET /api/auth — verify an existing token
- GET /api/products — retrieve the current inventory
- PUT /api/products — update inventory (requires auth)
- POST /api/upload — upload assets to Supabase (requires auth)

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
- SUPABASE_API_URL
- SUPABASE_API_KEY
- SUPABASE_INVENTORY_PATH
- SUPABASE_UPLOAD_PATH

## Updating content
- The storefront now fetches inventory from /api/products.
- To change inventory, update Supabase data through PUT /api/products or extend the admin UI.
