# Fixly Codebase Structure

## Repository Overview
The Fixly repository is organized into a client-server architecture with comprehensive documentation and planning materials.

## Directory Structure
```
Fixlygitsprint/
├── Documentation/
│   ├── 13_Fixly_UI_UX__.pdf
│   ├── G13_Fixly_Project_Proposal.pdf
│   ├── G13_Fixly_Requirements_Specification_Document.pdf
│   ├── G13_Fixly_System_design.pdf
│   ├── G13_Fixly_Task_Timelines&Milestones.pdf
│   ├── G13_Fixly_W4_Progress_Report.pdf
│   └── Testing/
├── ProductDetails/
│   ├── acceptance_criteria.md
│   ├── product_backlog.md
│   ├── product_requirements.md
│   ├── project_status_report.md
│   ├── roadmap.md
│   ├── sprint_planning.md
│   └── user_stories.md
├── README.md
├── client/
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── vite.config.js
├── code_docs/
│   ├── CLOUDINARY_SPRINT_SUMMARY.md
│   └── imageManagementAPI.md
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── utils/
    ├── package.json
    └── server.js
```

## Backend Structure (server/)

### Controllers
The server follows a controller-based architecture with dedicated controllers for each entity:
- `adminController.js` - Admin functionality
- `authController.js` - Authentication and authorization
- `bookingController.js` - Booking management
- `commissionController.js` - Commission calculations
- `complaintController.js` - User complaints
- `paymentController.js` - Payment processing
- `reportController.js` - Reporting functionality
- `reviewController.js` - Review and rating system
- `serviceCategoryController.js` - Service categories
- `serviceListingController.js` - Service listings
- `serviceProviderController.js` - Service provider profiles
- `settingsController.js` - Platform settings
- `specificReportController.js` - Specific report types
- `userController.js` - User management

### Models
Database models using Mongoose:
- `AdminEarnings.js` - Admin revenue tracking
- `Booking.js` - Booking records
- `Commission.js` - Commission settings
- `Complaint.js` - User complaints
- `Payment.js` - Payment records
- `Report.js` - User reports
- `Review.js` - Service reviews
- `ServiceCategory.js` - Service categories
- `ServiceListing.js` - Service listings
- `ServiceProvider.js` - Service provider profiles
- `Settings.js` - Platform settings
- `User.js` - User accounts

### Routes
API routing organized by entity:
- `api/admin.js` - Admin endpoints
- `api/auth.js` - Authentication endpoints
- `api/bookings.js` - Booking endpoints
- `api/categories.js` - Category endpoints
- `api/commissions.js` - Commission endpoints
- `api/complaints.js` - Complaint endpoints
- `api/listings.js` - Listing endpoints
- `api/payments.js` - Payment endpoints
- `api/providers.js` - Provider endpoints
- `api/reports.js` - Report endpoints
- `api/reviews.js` - Review endpoints
- `api/settings.js` - Settings endpoints
- `api/specificReports.js` - Specific report endpoints
- `api/users.js` - User endpoints

### Middleware
Custom middleware for common functionality:
- `auth.js` - Authentication and authorization
- `errorHandler.js` - Global error handling
- `validateProvider.js` - Provider validation

### Configuration
- `cloudinary.js` - Cloudinary image management
- `db.js` - Database connection

## Frontend Structure (client/)

### Components
Reusable UI components organized by feature:
- Authentication components
- Booking components
- Service listing components
- Profile management components
- Admin dashboard components

### Pages
Top-level page components:
- Home page
- Authentication pages (Login, Register)
- Service browsing pages
- Booking pages
- Profile pages
- Admin dashboard

### Services
API service layer for backend communication:
- Authentication services
- Booking services
- Payment services
- Profile services
- Admin services

### Context
React Context for state management:
- Authentication context
- Booking context
- User context

## Documentation Structure
Comprehensive documentation organized in:
- `ProductDetails/` - Product management documents
- `Documentation/` - Design and planning documents
- `code_docs/` - Technical API documentation