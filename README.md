# Budget Tracker

## 🎯 Project Overview

A modern budget tracking application built with Next.js, Drizzle ORM, and Clerk Auth. Track your income and expenses, analyze your spending trends.

**Key Features:**

- 🔐 Secure user authentication
- 💳 Category-based budget management
- 📊 Interactive charts and analytics
- 📱 Responsive design

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework (App Router)
- **Tailwind CSS** - Modern CSS framework
- **shadcn/ui** - UI component library
- **Recharts** - Chart visualization

### Backend & Database

- **Drizzle ORM** - Type-safe SQL ORM
- **PostgreSQL** - Database (Neon serverless)
- **Clerk** - Authentication

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/oguzkoc98/budget-tracker.git

# Install dependencies
npm install

# Set up environment variables (.env.local)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
DATABASE_URL=your_database_url

# Set up the database
npm run db:push

# Run the project
npm run dev
```

## 📁 Project Structure

```
budget-tracker/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication
│   ├── (routes)/dashboard/ # Main application
│   └── _components/       # Shared components
├── components/ui/         # UI components
├── utils/                 # Database config
└── middleware.ts          # Auth middleware
```

## 🌐 Demo

[**🌐 Live Demo**](https://oguzkoc-budget-tracker.vercel.app/)  
[**📂 Source Code**](https://github.com/oguzkoc98/budget-tracker)

---

### 📧 Contact

[**📧 Email**](mailto:oguzkoc98@gmail.com)  
[**💼 LinkedIn**](https://www.linkedin.com/in/oguzkoc98/)  
[**👨‍💻 GitHub**](https://github.com/oguzkoc98)
