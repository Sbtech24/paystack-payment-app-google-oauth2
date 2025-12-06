# Backend API — Google Sign-In & Paystack Payments

This is a **NestJS backend application** that provides:

- **Google OAuth 2.0 sign-in** (server-side)
- **Paystack payment integration** (initialize payments, verify transactions, webhook handling)
- **User & Transaction management** with PostgreSQL using TypeORM

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
- Handle Paystack webhooks
- Check transaction status
- Store users and transactions in PostgreSQL
- JWT token generation (optional)

---

## Tech Stack

- NestJS  
- TypeORM  
- PostgreSQL  
- Axios (for HTTP requests)  
- Passport & passport-google-oauth20  
- Paystack API  

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
