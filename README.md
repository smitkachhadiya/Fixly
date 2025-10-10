# Fixly - Service Marketplace Platform

## Overview
Fixly is a service marketplace platform that connects customers with service providers. This repository contains the backend implementation for the platform.

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
See [Image Management API Documentation](docs/imageManagementAPI.md) for details on the implemented endpoints.

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables (see .env.example)
4. Run `npm start` to start the server

## Testing
Run `npm test` to execute the test suite.