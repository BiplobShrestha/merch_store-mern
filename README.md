# Merch Store — MERN Ecommerce Project

A full-featured single-vendor merch store. Admin adds products with price and stock;
customers browse, add to cart, buy, and rate products they've purchased.

## Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth
- **Frontend**: React (Vite), React Router, Axios

## Features
- Auth (register/login, JWT, role-based access) — the first account ever registered becomes admin automatically
- Product CRUD (admin only) with search
- Cart (add/update/remove items)
- Checkout → creates an order and decrements stock atomically (no overselling)
- Order status pipeline (Pending → Processing → Shipped → Delivered → Cancelled), updated by admin
- Ratings — customers can only rate products from their own delivered/any order that actually contains that product
- Admin dashboard — manage products, view + update all orders

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
```
Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (local install or MongoDB Atlas free tier)
- `JWT_SECRET` — any long random string

Then run:
```bash
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend.

## First-time usage
1. Register the very first account — it automatically becomes **admin**.
2. Log in as admin, go to `/admin`, add a few products.
3. Register a second account (this one will be a normal **customer**).
4. Browse products, add to cart, checkout.
5. As admin, go to `/admin` → Orders tab, mark the order "Delivered".
6. As the customer, go to "My Orders" — a rating form now appears for that order's items.

## Notes / things you can extend later
- Add a real payment gateway (Stripe or eSewa/Khalti) at checkout instead of instant order creation
- Add image upload (Cloudinary) instead of pasting image URLs in the admin form
- Add pagination to the product listing
- Add category filter dropdown on the Home page (backend already supports `?category=`)
