# Fixly - Service Marketplace Platform

## Overview
Fixly is a modern service marketplace platform that connects customers with verified service providers.

## Business Process Overview

### Core Business Model
Fixly operates as a two-sided marketplace where customers can discover, book, and pay for various services from verified service providers. The platform generates revenue through service commissions (10-15% on each successful booking).

### Key Business Processes

#### 1. User Registration & Authentication
- Users can register as customers or service providers
- Secure authentication with JWT tokens and cookie sessions
- Password reset functionality via email verification
- Role-based access control (Customer, Provider, Admin)

#### 2. Service Category Management
- Admins can create, edit, and delete service categories
- Categories help organize services for easier discovery
- Each category can have a name, description, and associated image

#### 3. Service Provider Onboarding
- Service providers can create detailed profiles
- Providers can list their services with descriptions, pricing, and availability
- Profile verification process to ensure quality and trust

#### 4. Service Discovery & Booking
- Customers can browse and search for services by category, price, rating, or location
- Detailed service listings with descriptions, images, and provider information
- Booking system with date/time selection and special instructions
- Real-time availability checking to prevent double bookings

#### 5. Payment Processing
- Secure payment gateway integration for processing bookings
- Automatic commission calculation and deduction
- Support for major payment methods
- Payment status tracking and history

#### 6. Review & Rating System
- Customers can rate services (1-5 stars) after completion
- Detailed review functionality with text feedback
- Average ratings displayed on service listings
- Review moderation capabilities for admins

#### 7. Admin Platform Management
- User account management and monitoring
- Service listing approval and quality control
- Commission tracking and financial reporting
- Dispute resolution and customer support
- Platform analytics and business intelligence dashboard

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with secure cookie sessions
- **Image Management**: Cloudinary for cloud-based image storage and processing
- **Email Service**: Nodemailer for transactional emails
- **Middleware**:
  - bcryptjs for password hashing
  - cookie-parser for cookie management
  - cors for Cross-Origin Resource Sharing
  - morgan for HTTP request logging
  - multer for file uploads
  - dotenv for environment variable management

### Frontend (Client)
- **Framework**: React 19
- **Build Tool**: Vite 6
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS 4
- **UI Components**: 
  - React Toastify for notifications
  - Framer Motion for animations
  - React Chart.js 2 for data visualization
- **HTTP Client**: Axios for API requests
- **State Management**: Built-in React hooks and Context API

### Development & Testing
- **Package Management**: npm
- **Development Server**: Nodemon for auto-reloading
- **Testing**: Jest for unit testing, Supertest for API testing
- **Code Quality**: ESLint for linting

### Infrastructure & Deployment
- **Database Hosting**: MongoDB Atlas
- **Image Storage**: Cloudinary
- **Email Service**: SMTP-compatible email providers
- **Deployment**: Platform-agnostic (can be deployed on any cloud provider)

## Sprint: Cloudinary Image Management
This branch contains the implementation of Cloudinary image management functionality as part of sprint tasks #62-#68.

### Completed Tasks
1. Setup Cloudinary configuration in backend
2. Implement image upload endpoint for provider/service images
3. Implement image delete/update functionality
4. Store Cloudinary image URLs in database
5. Add validation for size, type, and format
6. Write test cases for image upload/delete APIs
7. Document image management endpoints

## API Documentation
See [Image Management API Documentation](code_docs/imageManagementAPI.md) for details on the implemented endpoints.

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables (see .env.example)
4. Run `npm start` to start the server

## Testing
Run `npm test` to execute the test suite.

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.