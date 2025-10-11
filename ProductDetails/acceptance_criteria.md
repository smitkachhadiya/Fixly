# Fixly Acceptance Criteria Guidelines

## Overview
This document provides guidelines and examples for writing clear, testable acceptance criteria for user stories in the Fixly platform. Well-defined acceptance criteria are essential for ensuring that development efforts align with product requirements.

## Product Owner
**Name**: Harsh Kathrotiya
**ID**: 202412036

## Current Status Update (October 11, 2025)
- All backend acceptance criteria have been implemented and tested
- Frontend implementation of acceptance criteria in progress
- Focus on frontend-backend integration testing
- Preparing demo for Mid-Semester Presentation (Due: Oct 14, 2025)

## What Are Acceptance Criteria?
Acceptance criteria are conditions that a software product must satisfy to be accepted by a stakeholder. They define the boundaries of a user story and provide a clear understanding of when a feature is complete.

## Importance of Acceptance Criteria
- Ensure shared understanding between stakeholders and development team
- Provide a basis for testing and quality assurance
- Help in effort estimation and planning
- Reduce ambiguity and rework
- Facilitate better communication

## INVEST Model for User Stories
Acceptance criteria should support user stories that follow the INVEST model:
- **I**ndependent: Stories can be developed independently
- **N**egotiable: Details can be refined through collaboration
- **V**aluable: Stories deliver value to users
- **E**stimable: Stories can be sized appropriately
- **S**mall: Stories can be completed within a sprint
- **T**estable: Stories have clear acceptance criteria

## Guidelines for Writing Acceptance Criteria

### 1. Be Specific and Clear
- Use simple, unambiguous language
- Avoid technical jargon when possible
- Focus on behavior, not implementation

### 2. Make Them Testable
- Write in a way that allows for verification
- Include measurable outcomes
- Define both positive and negative scenarios

### 3. Keep Them Concise
- Focus on essential requirements
- Avoid unnecessary details
- Use bullet points or numbered lists for clarity

### 4. Use the Given-When-Then Format
This format helps structure acceptance criteria clearly:
- **Given**: Precondition or context
- **When**: Action or event
- **Then**: Expected outcome

### 5. Cover Edge Cases
- Consider error conditions
- Think about boundary values
- Include alternative flows

## Examples by Feature Area

### Authentication System

#### User Registration
```
Given I am on the registration page
When I fill in valid email and password
Then I should receive a confirmation message

Given I enter an email that already exists
When I try to register
Then I should see an error message "Email already registered"

Given I enter an invalid email format
When I try to register
Then I should see a validation error "Please enter a valid email"

Given I enter a weak password
When I try to register
Then I should see password strength requirements
```

#### User Login
```
Given I am on the login page
When I enter correct credentials
Then I should be redirected to my dashboard

Given I enter incorrect credentials
When I try to log in
Then I should see an error message "Invalid email or password"

Given I forget my password
When I click "Forgot Password"
Then I should be directed to the password reset page
```

### Service Categories

#### View Categories
```
Given I am on the homepage
When I view the categories section
Then I should see all available categories with names and images

Given there are more than 10 categories
When I view the categories
Then they should be displayed in a scrollable grid

Given I click on a category
When I select it
Then I should be taken to the category detail page
```

#### Admin Manage Categories
```
Given I am an admin on the dashboard
When I create a new category with name and description
Then it should appear in the category list

Given I am an admin
When I edit a category name
Then the change should be reflected immediately for new visitors

Given I am an admin
When I delete a category with no associated services
Then it should be removed from the system

Given a category has associated services
When I try to delete it
Then I should see a warning message "This category has 5 services. Please reassign them first."
```

### Service Listings

#### Create Service Listing
```
Given I am a provider on the create listing page
When I fill in all required fields (title, description, category, price)
Then my listing should be saved as draft

Given I am a provider
When I upload images
Then they should be displayed in the preview

Given I am a provider
When I set my availability schedule
Then customers should only be able to book during those times

Given I submit an incomplete form
When I try to create a listing
Then I should see validation errors for missing fields
```

#### Browse Service Listings
```
Given I am on the services page
When I view listings
Then I should see title, description, price, and rating for each

Given there are many listings
When I browse
Then they should be paginated (10 per page)

Given I search for specific keywords
When I enter them in the search box
Then I should see relevant results first

Given I filter by category
When I select a category
Then I should only see listings in that category
```

### Booking System

#### Customer Book Service
```
Given I am viewing a service detail page
When I select a date and time from available slots
Then I should be able to proceed to confirmation

Given I select an unavailable time slot
When I try to book
Then I should see an error message "Time slot not available"

Given I confirm my booking
When I submit
Then I should receive a confirmation email and see a booking confirmation page

Given I need to cancel
When I cancel more than 24 hours before the appointment
Then I should receive a full refund and confirmation
```

#### Provider Manage Bookings
```
Given I am a provider on my dashboard
When I view the bookings section
Then I should see all my upcoming bookings sorted by date

Given I have a new booking
When it is made
Then I should receive an in-app notification and email

Given I need to reschedule
When I update a booking with customer agreement
Then the customer should receive notification of the change

Given a customer cancels
When they do so
Then I should see the cancellation in my schedule with reason
```

### Payment System

#### Customer Make Payment
```
Given I have selected a service
When I proceed to payment
Then I should see payment options (Credit Card, PayPal)

Given I enter valid payment information
When I submit
Then my payment should be processed and I should see a confirmation

Given my payment is successful
When it completes
Then my booking should be confirmed and I should receive a receipt

Given my payment fails
When it is declined
Then I should see an error message and can retry or choose another method
```

### Reviews & Ratings

#### Customer Leave Review
```
Given I have completed a booking
When I visit the service page
Then I should see a "Leave Review" button

Given I submit a review with rating and text
When I click submit
Then it should appear on the service page with my name and date

Given I try to submit an empty review
When I click submit
Then I should see validation errors "Please provide a rating and comment"

Given I want to edit my review
When I access my review within 7 days of posting
Then I should be able to update the rating and comment
```

## Quality Attributes in Acceptance Criteria

### Performance
```
Given the system has 1000 concurrent users
When I load the homepage
Then it should load within 3 seconds

Given I am uploading an image
When the file is larger than 5MB
Then I should see an error "File size must be less than 5MB"
```

### Security
```
Given I am not logged in
When I try to access the admin dashboard
Then I should be redirected to the login page

Given I am logged in as a customer
When I try to access provider-only features
Then I should see an "Access Denied" message
```

### Usability
```
Given I am on a mobile device
When I browse the site
Then all elements should be properly sized for touch interaction

Given I am using a screen reader
When I navigate the site
Then all content should be readable and navigable
```

## Review Process

### Before Development
1. Product Owner reviews acceptance criteria with stakeholders
2. Development team reviews for technical feasibility
3. QA team reviews for testability
4. All questions are clarified before sprint planning

### During Development
1. Developers use acceptance criteria as implementation guide
2. QA team uses acceptance criteria to create test cases
3. Product Owner is available for clarification questions

### After Development
1. All acceptance criteria are verified during testing
2. Product Owner validates that criteria are met
3. Any gaps identified are documented for future stories

## Common Pitfalls to Avoid

1. **Too Vague**: "System should be user-friendly" - Not testable
2. **Too Technical**: "Database query should execute in < 100ms" - Focus on user experience
3. **Too Many Criteria**: >10 per story - May indicate story is too large
4. **Implementation Details**: "Use React component X" - Focus on what, not how
5. **Missing Negative Cases**: Only happy path scenarios - Include error conditions

## Template for New User Stories

When creating new user stories, use this template:

```
### [Story Title]
**Priority**: [P0/P1/P2/P3]

As a [user type], I want to [goal] so that [reason].

**Acceptance Criteria**:
- Given [context], when [action], then [outcome]
- Given [context], when [action], then [outcome]
- ...

**Edge Cases**:
- Given [context], when [exceptional action], then [outcome]
- ...

**Non-functional Requirements**:
- [Performance/Security/Usability requirement]
- ...
```

## Maintenance

This document should be reviewed and updated:
- Quarterly or when major process changes occur
- When new patterns emerge in acceptance criteria
- When team feedback indicates confusion or inconsistency