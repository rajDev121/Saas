# Company Dashboard - Secure Role-Based SaaS Application

A comprehensive internal SaaS dashboard built with Next.js, MongoDB, and Nodemailer for managing employees, attendance, and email communications across multiple business units.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, HR, Employee)
- OTP-based password reset via email
- Secure session management

### 👥 User Management
- **Admin**: Full CRUD operations for employees and HR
- **HR**: Email sending and employee viewing capabilities
- **Employee**: Profile management and attendance tracking

### 📧 Email System
- Bulk email sending to business units (buss1, buss2, buss3, or all)
- Pre-built email templates for different business units
- Email history tracking with sender details
- Nodemailer integration with fallback simulation

### ⏰ Attendance Management
- Daily check-in/check-out for employees
- Automatic hours calculation
- Attendance status tracking (Present/Partial/Absent)
- Admin dashboard for attendance logs and analytics

### 🎨 Modern UI/UX
- Clean SaaS-style dashboard design
- Responsive sidebar navigation
- Role-based menu visibility
- Real-time greeting with time display
- Professional card-based layouts

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with connection pooling
- **Authentication**: JWT, bcryptjs
- **Email**: Nodemailer with HTML templates
- **UI Components**: Radix UI primitives

## 📋 Demo Credentials

\`\`\`
Admin:
Email: admin@company.com
Password: admin123

HR:
Email: hr@company.com  
Password: hr123

Employee:
Email: pm@company.com
Password: emp123
\`\`\`

## 🚀 Quick Start

1. **Clone and Install**
   \`\`\`bash
   git clone <repository-url>
   cd company-dashboard
   npm install
   \`\`\`

2. **Environment Setup**
   Create `.env.local` file:
   \`\`\`env
   # Database
   MONGODB_URI=mongodb://localhost:27017/company_dashboard
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   
   # Email (Optional - will simulate if not provided)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=Company Dashboard <noreply@company.com>
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Seed the database with demo users
   npm run seed
   \`\`\`

4. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── employees/      # Employee management
│   │   ├── email/          # Email sending & history
│   │   ├── attendance/     # Attendance tracking
│   │   └── profile/        # User profile management
│   ├── dashboard/          # Protected dashboard pages
│   └── forgot-password/    # Password reset flow
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── app-sidebar.tsx     # Main navigation sidebar
├── lib/
│   ├── mongodb.js          # Database connection
│   ├── auth.js             # Authentication utilities
│   └── nodemailer.js       # Email service
├── data/
│   └── email-templates/    # Business unit email templates
└── scripts/
    └── seed-database.js    # Database seeding script
\`\`\`

## 🔧 Configuration Options

### Database
- **MongoDB**: Local or cloud MongoDB instance
- **Mock Mode**: Automatic fallback when MongoDB is unavailable
- **Connection Pooling**: Optimized for production use

### Email Service
- **SMTP**: Configure with any SMTP provider (Gmail, SendGrid, etc.)
- **Simulation Mode**: Emails logged to console when SMTP not configured
- **Templates**: JSON-based templates for different business units

### Authentication
- **JWT Tokens**: 7-day expiration with secure signing
- **Password Hashing**: bcrypt with 12 rounds
- **OTP System**: 6-digit codes with 5-minute expiration

## 🎯 Role-Based Features

### Admin Dashboard
- Employee management (CRUD operations)
- Email sending to all business units
- Attendance logs and analytics
- Email history tracking
- Full system access

### HR Dashboard
- Email sending capabilities
- Employee list viewing
- Profile management
- Limited administrative access

### Employee Dashboard
- Daily attendance check-in/out
- Personal profile management
- Password change via OTP
- Attendance history viewing

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access Control**: Endpoint-level authorization
- **OTP Verification**: Time-limited password reset
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for production security

## 📊 Business Intelligence

- **Dashboard Analytics**: Employee count, email metrics, attendance stats
- **Attendance Tracking**: Hours worked, status monitoring
- **Email Analytics**: Send history, recipient tracking
- **User Activity**: Login patterns, feature usage

## 🚀 Deployment

### Environment Variables for Production
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/company_dashboard
JWT_SECRET=your-production-jwt-secret-key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=Company Dashboard <noreply@yourcompany.com>
\`\`\`

### Build and Deploy
\`\`\`bash
npm run build
npm start
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the demo credentials
- Examine the API endpoints
- Test with the seeded data

---

Built with ❤️ using Next.js, MongoDB, and modern web technologies.
