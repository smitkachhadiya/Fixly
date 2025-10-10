# Image Management API Documentation

## Overview
This document describes the image management endpoints for the Fixly platform. These endpoints allow service providers to upload, update, and delete images for their service listings and profiles.

## Authentication
All endpoints require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Upload Service Provider Profile Image
Upload a profile image for the authenticated service provider.

**URL**: `PUT /api/providers/profile/image`  
**Method**: `PUT`  
**Auth required**: YES  
**Permissions required**: Authenticated service provider

#### Request
- **Form Data**:
  - `image` - The image file to upload (JPG, JPEG, PNG)
  
#### Success Response
**Code**: `200 OK`  
**Content**:
```json
{
  "success": true,
  "data": {
    "userId": {
      "profilePicture": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/filename.jpg"
    }
  }
}
```

#### Error Responses
- **Code**: `400 BAD REQUEST` - No image file provided
- **Code**: `404 NOT FOUND` - Service provider profile not found

---

### Upload Service Listing Image
Upload an image for a specific service listing.

**URL**: `PUT /api/listings/:id/image`  
**Method**: `PUT`  
**Auth required**: YES  
**Permissions required**: Service Provider who owns the listing

#### Request
- **URL Parameters**: 
  - `id` - The ID of the service listing
- **Form Data**:
  - `image` - The image file to upload (JPG, JPEG, PNG)
  
#### Success Response
**Code**: `200 OK`  
**Content**:
```json
{
  "success": true,
  "data": {
    "serviceImage": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/filename.jpg"
  }
}
```

#### Error Responses
- **Code**: `400 BAD REQUEST` - No image file provided
- **Code**: `403 FORBIDDEN` - User not authorized to update this listing
- **Code**: `404 NOT FOUND` - Service listing not found

---

### Delete Service Listing Image
Delete the image from a specific service listing.

**URL**: `DELETE /api/listings/:id/image`  
**Method**: `DELETE`  
**Auth required**: YES  
**Permissions required**: Service Provider who owns the listing

#### Request
- **URL Parameters**: 
  - `id` - The ID of the service listing

#### Success Response
**Code**: `200 OK`  
**Content**:
```json
{
  "success": true,
  "data": {
    "serviceImage": ""
  }
}
```

#### Error Responses
- **Code**: `403 FORBIDDEN` - User not authorized to update this listing
- **Code**: `404 NOT FOUND` - Service listing not found

## File Validation

### Supported File Types
- JPG
- JPEG
- PNG

### File Size Limits
- Service listing images: 5MB maximum
- Profile images: 2MB maximum

## Cloudinary Integration

### Storage Structure
Images are stored in Cloudinary with the following folder structure:
- Service listing images: `fixly/services/`
- Category images: `fixly/categories/`
- Profile images: `fixly/profiles/`
- Documents: `fixly/documents/`

### Image Transformations
All images are automatically transformed to:
- Maximum dimensions: 500x500 pixels
- Cropped to fit within these dimensions while maintaining aspect ratio

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Errors
When file validation fails, the API returns specific error messages:
- `Invalid file type. Only .jpg, .jpeg, .png files are allowed.`
- `File size exceeds 5MB limit.`

## Examples

### Uploading a Profile Image with cURL
```bash
curl -X PUT \
  http://localhost:5000/api/providers/profile/image \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'image=@/path/to/your/profile-image.jpg'
```

### Uploading a Service Listing Image with cURL
```bash
curl -X PUT \
  http://localhost:5000/api/listings/5f9d88d1b547233e88d1b547/image \
  -H 'Authorization: Bearer your-jwt-token' \
  -F 'image=@/path/to/your/image.jpg'
```

### Deleting a Service Listing Image with cURL
```bash
curl -X DELETE \
  http://localhost:5000/api/listings/5f9d88d1b547233e88d1b547/image \
  -H 'Authorization: Bearer your-jwt-token'
```