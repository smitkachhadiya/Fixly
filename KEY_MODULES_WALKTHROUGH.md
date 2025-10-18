# Fixly Key Modules Walkthrough

## 1. Authentication & User Management

### Overview
The authentication system handles user registration, login, and role-based access control for three user types:
- Customers
- Service Providers
- Admins

### Key Components
- **authController.js**: Handles registration, login, logout, and password reset
- **User.js model**: User schema with role-based fields
- **auth.js middleware**: Protects routes and verifies JWT tokens
- **JWT implementation**: Secure token-based authentication

### Features
- Email/password registration with validation
- Secure password hashing with bcrypt
- JWT token generation with HttpOnly cookies
- Role-based authorization (customer, service_provider, admin)
- Password reset functionality with email verification

## 2. Service Categories

### Overview
Service categories organize listings for easier discovery and browsing.

### Key Components
- **serviceCategoryController.js**: CRUD operations for categories
- **ServiceCategory.js model**: Category schema with name, description, and image
- **categories.js routes**: RESTful endpoints for category management

### Features
- Admin-only creation, editing, and deletion
- Category images stored in Cloudinary
- Public listing retrieval with pagination

## 3. Service Listings

### Overview
Service listings are the core of the platform, allowing providers to offer their services to customers.

### Key Components
- **serviceListingController.js**: Complete CRUD operations for listings
- **ServiceListing.js model**: Listing schema with title, description, price, images
- **listings.js routes**: RESTful endpoints for listing management

### Key Features
- Provider-only creation and management
- Image upload via Cloudinary integration
- Rich text descriptions and pricing
- Category association
- Availability scheduling
- Status management (active/inactive)
- Search and filtering capabilities

### Cloudinary Integration
- Service images stored in `fixly/services/` folder
- Automatic resizing to 500x500px
- File validation (JPG, JPEG, PNG) with 5MB limit
- Secure deletion when listings are removed

## 4. Booking System

### Overview
The booking system enables customers to schedule appointments with service providers.

### Key Components
- **bookingController.js**: Booking creation, management, and status updates
- **Booking.js model**: Booking schema with date, time, status tracking
- **bookings.js routes**: RESTful endpoints for booking operations

### Features
- Real-time availability checking
- Booking status tracking (Pending, Confirmed, Completed, Cancelled)
- Automatic conflict prevention
- Provider and customer notifications
- Cancellation policies with refund calculations

## 5. Payment Processing

### Overview
Secure payment processing for service bookings with commission calculations.

### Key Components
- **paymentController.js**: Payment processing and webhook handling
- **Payment.js model**: Payment records with transaction details
- **payments.js routes**: Payment endpoints

### Features
- Integration with payment gateway (implementation details in controller)
- Automatic commission calculation (10-15%)
- Payment status tracking
- Refund processing
- Transaction history

## 6. Review & Rating System

### Overview
Customer feedback system to build trust and quality assurance.

### Key Components
- **reviewController.js**: Review creation, retrieval, and management
- **Review.js model**: Review schema with rating (1-5 stars) and text
- **reviews.js routes**: Review endpoints

### Features
- Post-booking review submission
- Average rating calculation for providers and listings
- Review moderation capabilities
- Public display of reviews

## 7. Admin Dashboard

### Overview
Comprehensive platform management for administrators.

### Key Components
- **adminController.js**: Admin-specific functionality
- **AdminEarnings.js model**: Revenue tracking
- **Commission.js model**: Commission settings
- **admin.js routes**: Admin endpoints

### Features
- User account management
- Service listing approval
- Commission rate configuration
- Financial reporting
- Dispute resolution
- Platform analytics

## 8. Cloudinary Image Management

### Overview
Cloud-based image storage and processing for all platform images.

### Key Components
- **cloudinary.js config**: Cloudinary setup and storage configuration
- **serviceImageUpload middleware**: Multer configuration for image uploads
- **profileImageUpload middleware**: Profile image upload configuration

### Features
- Automatic image optimization
- Folder organization (services, categories, profiles)
- File type and size validation
- Secure image deletion
- Transformation parameters (resizing, cropping)

### Implementation Details
- Images stored in separate Cloudinary folders based on type
- Automatic resizing to 500x500px while maintaining aspect ratio
- Supported formats: JPG, JPEG, PNG
- Size limits: 5MB for services, 2MB for profiles/categories
- Direct integration with service listing and provider profile updates

## Integration Points

### Database Relationships
- Users link to ServiceProviders (one-to-one)
- ServiceProviders link to ServiceListings (one-to-many)
- ServiceListings link to Bookings (one-to-many)
- Bookings link to Payments and Reviews (one-to-one)
- ServiceCategories link to ServiceListings (one-to-many)

### API Contracts
- RESTful endpoints with consistent naming conventions
- Standardized response format with success flag
- Error handling with descriptive messages
- Pagination for list endpoints
- Search and filtering capabilities

### Security Measures
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- Password hashing
- CORS configuration
- Rate limiting (implementation in server.js)