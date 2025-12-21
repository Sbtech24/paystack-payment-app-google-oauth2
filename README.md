# Wallet Service — Google Sign-In & Paystack Payments

This is a  **Wallet service built with Nest Js ** that provides:

- **Google OAuth 2.0 sign-in** (server-side)
- **Paystack payment integration** (initialize payments, verify transactions, webhook handling)
- **User & Transaction management** with PostgreSQL using TypeORM
- **User wallet with transasction simulation- Transfer,deposit,Real time balance updates** with PostgreSQL using TypeORM

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Setup](#setup)  
- [Environment Variables](#environment-variables)  
- [Database](#database)  
- [Running the Application](#running-the-application)  
- [API Endpoints](#api-endpoints)  
- [Testing with Postman](#testing-with-postman)  
- [Notes](#notes)

---

## Features

- Secure Google Sign-In flow
- Initialize Paystack payments
- Deposit funds
- Transfer funds from one user to another
- Handle Paystack webhooks
- Check transaction status
- Store users and transactions in PostgreSQL
- JWT token generation (optional)
- Get wallet balnace

---

## Tech Stack

- NestJS  
- TypeORM  
- PostgreSQL  
- Axios (for HTTP requests)  
- Passport & passport-google-oauth20  
- Paystack API
- Crypto 

---

## Prerequisites

- Node.js >= 18  
- PostgreSQL  
- Yarn or npm  

---

## Setup

1. Clone the repository:

```bash
git clone <repo-url>
cd <repo-folder>
npm i
```
set .env - check .env.example

2. Run the application:
 ```bash
 npm run start:dev


