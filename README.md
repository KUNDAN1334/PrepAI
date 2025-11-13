# Prep AI - AI-Powered Interview Preparation Platform

> Your complete interview companion powered by artificial intelligence

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.3-green)](https://www.mongodb.com/)
[![Groq AI](https://img.shields.io/badge/Groq-AI-orange)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

Prep AI is an all-in-one AI-powered platform designed to streamline interview preparation and job search management. It combines company research, resume optimization, mock interviews, application tracking, and community-driven interview questions into a unified platform.

### Why Prep AI?

- 🚀 Save hours on research  
- 📈 Improve ATS resume compatibility  
- 🎤 Practice with AI-powered mock interviews  
- 🗂 Stay organized with smart tracking  
- 🤝 Learn from real interview questions  

---

## ✨ Features

### 🔍 Company Intelligence Engine
- Aggregates data from Reddit, LinkedIn, Twitter  
- Interview process by rounds  
- Salary insights  
- Candidate reviews  
- 7-day intelligent caching  

### 📄 AI Resume Optimizer
- Upload PDF/DOCX  
- Match score (0–100%)  
- ATS compatibility analysis  
- Missing keywords detection  
- Detailed improvement suggestions  

### 🎤 Mock Interview Simulator
- Company/role-specific questions  
- Real-time Q&A  
- AI scoring + feedback  
- Strengths & improvement insights  
- Interview history  

### 📊 Application Tracker
- Kanban, table & calendar views  
- Track interviews & rounds  
- Smart reminders  
- Analytics dashboard  
- Export to CSV/PDF  

### 💬 Interview Question Bank
- Community question sharing  
- Filters for role/company/difficulty  
- Upvotes/downvotes  
- Answer contributions  
- AI duplicate detection  

---

## 🛠️ Tech Stack

### Frontend
- Next.js 14  
- TypeScript  
- TailwindCSS  
- Shadcn/UI  

### Backend
- Node.js  
- Next.js API Routes  
- NextAuth.js v5  
- MongoDB + Mongoose  

### AI & Parsing
- Groq API  
- pdf-parse, mammoth  

### Deployment
- Vercel  
- MongoDB Atlas  

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+  
- npm / yarn / pnpm  
- MongoDB (local or Atlas)  
- Git  

### Installation

Clone the repo:

```bash
git clone https://github.com/yourusername/prep-ai.git
cd prep-ai
```

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env.local
```

Run the dev server:

```bash
npm run dev
```

Visit:  
http://localhost:3000

---

## Environment Variables

Add the following to `.env.local`:

```
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/prepai
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

GROQ_API_KEY=gsk_your_groq_api_key
```

---

## 📖 Usage

### For Job Seekers
- Research companies  
- Optimize resumes  
- Run mock interviews  
- Track applications  
- Browse interview questions  

### For Contributors
- Add/update interview questions  
- Earn reputation  
- Help the community  

---

## 📁 Project Structure

```
prep-ai/
├── app/
│   ├── (auth)/
│   ├── dashboard/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── lib/
├── models/
├── hooks/
├── types/
├── public/
└── package.json
```

---

##  API Documentation

### Authentication  
**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Company Research  
**GET** `/api/company/search?query=google`

### Resume Optimization  
**POST** `/api/resume/optimize`
```json
{
  "resumeText": "...",
  "jobDescription": "..."
}
```

### Mock Interview  
**POST** `/api/mock-interview/create`

### Application Tracker  
- **GET** `/api/applications`  
- **POST** `/api/applications`  
- **PUT** `/api/applications/[id]`  
- **DELETE** `/api/applications/[id]`  

---

## Database Schema

### Users
```json
{
  "name": "String",
  "email": "String",
  "subscription": "free | pro"
}
```

### Applications
```json
{
  "companyName": "String",
  "status": "String",
  "interviewRounds": []
}
```

Interview Sessions & Questions follow similar structure.

---

## Contributing

```bash
git checkout -b feature/NewFeature
git commit -m "Add feature"
git push origin feature/NewFeature
```

---

## Troubleshooting

### MongoDB Error  
Check `DATABASE_URL`

### NextAuth Error  
Verify `NEXTAUTH_SECRET`

---

## 📝 License  
MIT License
