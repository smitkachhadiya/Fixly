# Fixly User Stories

## Overview
This document contains detailed user stories for the Fixly platform. Each story follows a standard format to ensure clarity for the development team.

## Product Owner
**Name**: Harsh Kathrotiya
**ID**: 202412036

## Story Template
```
As a [user type], I want to [goal] so that [reason].
```

## Acceptance Criteria Format
- Given [context], when [action], then [outcome]

## Priority Legend
- **P0**: Critical - Must have for MVP
- **P1**: High - Important but not critical for MVP
- **P2**: Medium - Nice to have
- **P3**: Low - Future enhancement

## Current Development Status (October 11, 2025)
- All P0 user stories have backend APIs implemented
- Frontend implementation in progress for all P0 stories
- Preparing demo for Mid-Semester Presentation (Due: Oct 14, 2025)
- Focus on completing frontend for Authentication, Service Listings, Booking, and Payment systems

---

## Authentication & User Management

### US-001: User Registration
**Priority**: P0

As a new user, I want to register for an account so that I can access the Fixly platform.

**Acceptance Criteria**:
- Given I am on the registration page, when I fill in valid email and password, then I should receive a confirmation message
- Given I enter an email that already exists, when I try to register, then I should see an error message
- Given I enter an invalid email format, when I try to register, then I should see a validation error
- Given I enter a weak password, when I try to register, then I should see password strength requirements

### US-002: User Login
**Priority**: P0

As a registered user, I want to log in to my account so that I can access my profile and services.

**Acceptance Criteria**:
- Given I enter correct credentials, when I submit the login form, then I should be redirected to my dashboard
- Given I enter incorrect credentials, when I try to log in, then I should see an error message
- Given I forget my password, when I click "Forgot Password", then I should be able to reset it

### US-003: Password Reset
**Priority**: P1

As a user who forgot my password, I want to reset it so that I can regain access to my account.

**Acceptance Criteria**:
- Given I enter my registered email, when I request a password reset, then I should receive a reset link
- Given I click the reset link, when I enter a new password, then my password should be updated
- Given I use an expired reset link, when I try to reset my password, then I should see an expiration message

---

## Service Categories

### US-004: View Service Categories
**Priority**: P0

As a user, I want to browse service categories so that I can find the type of service I need.

**Acceptance Criteria**:
- Given I am on the homepage, when I view the categories section, then I should see all available categories
- Given there are more than 10 categories, when I view the categories, then they should be paginated or scrollable
- Given I click on a category, when I select it, then I should see all services in that category

### US-005: Admin Manage Categories
**Priority**: P1

As an admin, I want to create, edit, and delete service categories so that I can organize services effectively.

**Acceptance Criteria**:
- Given I am an admin on the dashboard, when I create a new category with name and description, then it should appear in the category list
- Given I am an admin, when I edit a category name, then the change should be reflected immediately
- Given I am an admin, when I delete a category, then it should be removed from the system
- Given a category has associated services, when I try to delete it, then I should see a warning message

---

## Service Listings

### US-006: Provider Create Service Listing
**Priority**: P0

As a service provider, I want to create a service listing so that customers can discover and book my services.

**Acceptance Criteria**:
- Given I am a provider, when I fill in all required fields (title, description, category, price), then my listing should be created
- Given I am a provider, when I upload images, then they should be displayed with my listing
- Given I am a provider, when I set my availability, then customers should only be able to book during those times
- Given I submit an incomplete form, when I try to create a listing, then I should see validation errors

### US-007: Customer Browse Service Listings
**Priority**: P0

As a customer, I want to browse service listings so that I can find services that meet my needs.

**Acceptance Criteria**:
- Given I am on the services page, when I view listings, then I should see title, description, price, and rating
- Given there are many listings, when I browse, then they should be paginated
- Given I search for specific keywords, when I enter them in the search box, then I should see relevant results
- Given I filter by category, when I select a category, then I should only see listings in that category

### US-008: Customer View Service Details
**Priority**: P0

As a customer, I want to view detailed information about a service so that I can make an informed booking decision.

**Acceptance Criteria**:
- Given I click on a service listing, when I view the details page, then I should see all service information
- Given the service has images, when I view the details, then I should see an image gallery
- Given the service has reviews, when I view the details, then I should see average rating and individual reviews
- Given the provider has other listings, when I view the details, then I should see their other services

---

## Booking System

### US-009: Customer Book Service
**Priority**: P0

As a customer, I want to book a service so that I can schedule an appointment with a provider.

**Acceptance Criteria**:
- Given I am viewing a service, when I select a date and time, then I should be able to confirm my booking
- Given I select an unavailable time slot, when I try to book, then I should see an error message
- Given I confirm my booking, when I submit, then I should receive a confirmation email
- Given I need to cancel, when I cancel before 24 hours, then I should receive a full refund

### US-010: Provider Manage Bookings
**Priority**: P1

As a service provider, I want to view and manage my bookings so that I can plan my schedule effectively.

**Acceptance Criteria**:
- Given I am a provider, when I view my dashboard, then I should see all my upcoming bookings
- Given I have a new booking, when it is made, then I should receive a notification
- Given I need to reschedule, when I update a booking, then the customer should be notified
- Given a customer cancels, when they do so, then I should see the cancellation in my schedule

---

## Payment System

### US-011: Customer Make Payment
**Priority**: P0

As a customer, I want to pay for my booking so that I can confirm my appointment.

**Acceptance Criteria**:
- Given I have selected a service, when I proceed to payment, then I should see payment options
- Given I enter valid payment information, when I submit, then my payment should be processed
- Given my payment is successful, when it completes, then I should see a confirmation message
- Given my payment fails, when it is declined, then I should see an error and can retry

### US-012: Provider Receive Payments
**Priority**: P1

As a service provider, I want to receive payments for completed services so that I can earn income.

**Acceptance Criteria**:
- Given I complete a service, when the booking is marked as complete, then I should receive payment minus commission
- Given there is a dispute, when it is resolved in my favor, then I should receive payment
- Given I view my earnings, when I check my dashboard, then I should see payment history

---

## Reviews & Ratings

### US-013: Customer Leave Review
**Priority**: P1

As a customer, I want to leave a review for a service so that I can share my experience and help other users.

**Acceptance Criteria**:
- Given I have completed a booking, when I visit the service page, then I should be able to leave a review
- Given I submit a review, when I provide rating and text, then it should appear on the service page
- Given I try to submit an empty review, when I click submit, then I should see validation errors
- Given I want to edit my review, when I access my review, then I should be able to update it

### US-014: View Reviews
**Priority**: P1

As a user, I want to see reviews for services so that I can make informed decisions.

**Acceptance Criteria**:
- Given I am viewing a service, when I look at the reviews section, then I should see all reviews with ratings
- Given there are many reviews, when I view them, then they should be sorted by date or helpfulness
- Given I want to see the reviewer's name, when I view a review, then I should see who wrote it
- Given a review is inappropriate, when reported, then it should be hidden pending review

---

## Admin Dashboard

### US-015: Admin View Analytics
**Priority**: P1

As an admin, I want to view platform analytics so that I can monitor business performance.

**Acceptance Criteria**:
- Given I am on the admin dashboard, when I view analytics, then I should see key metrics (bookings, revenue, users)
- Given I want to see trends, when I select a date range, then I should see data for that period
- Given I want to export data, when I click export, then I should be able to download reports
- Given there is an issue, when I view alerts, then I should see notifications for attention items

### US-016: Admin Manage Users
**Priority**: P1

As an admin, I want to manage users so that I can maintain platform quality.

**Acceptance Criteria**:
- Given I am on the admin dashboard, when I view users, then I should see a list of all users
- Given a user violates terms, when I take action, then I should be able to suspend or ban them
- Given I need to contact a user, when I view their profile, then I should see contact information
- Given I want to search for a user, when I enter keywords, then I should find relevant results

---

## Search & Discovery

### US-017: Advanced Search
**Priority**: P2

As a user, I want to search for services using filters so that I can find exactly what I need.

**Acceptance Criteria**:
- Given I am searching for services, when I use filters (price, rating, location), then I should see refined results
- Given I search with keywords, when I enter terms, then I should see relevant matches
- Given I want to sort results, when I select sort options, then results should be ordered accordingly
- Given no results match my search, when I search, then I should see helpful suggestions

### US-018: Location-Based Search
**Priority**: P2

As a user, I want to find services near my location so that I can book convenient appointments.

**Acceptance Criteria**:
- Given I enable location services, when I search, then results should be sorted by proximity
- Given I enter a location manually, when I search, then results should be near that location
- Given a service doesn't have location data, when I search by location, then it should be handled appropriately
- Given I want to see location on a map, when I view results, then I should have map visualization

---

## Notifications

### US-019: Receive Booking Notifications
**Priority**: P1

As a user, I want to receive notifications about my bookings so that I'm informed of important updates.

**Acceptance Criteria**:
- Given I make a booking, when it's confirmed, then I should receive an email and in-app notification
- Given my booking status changes, when it updates, then I should be notified
- Given I want to customize notifications, when I access settings, then I should be able to choose preferences
- Given I want to unsubscribe, when I manage notifications, then I should be able to opt out

---

## Profile Management

### US-020: Manage User Profile
**Priority**: P1

As a user, I want to manage my profile information so that I can keep my details current.

**Acceptance Criteria**:
- Given I am on my profile page, when I edit information, then changes should be saved
- Given I want to change my password, when I access security settings, then I should be able to update it
- Given I want to update my profile picture, when I upload an image, then it should be displayed
- Given I enter invalid data, when I try to save, then I should see validation errors

### US-021: Provider Manage Business Profile
**Priority**: P1

As a service provider, I want to manage my business profile so that I can attract more customers.

**Acceptance Criteria**:
- Given I am a provider, when I edit my business information, then changes should be visible to customers
- Given I want to showcase my work, when I upload portfolio images, then they should appear on my profile
- Given I want to set my business hours, when I configure availability, then customers should see when I'm available
- Given I want to add service areas, when I specify locations, then I should appear in relevant searches