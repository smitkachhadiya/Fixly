# Fixly Sprint Planning

## Overview
This document outlines the sprint planning approach for the Fixly development team. It includes guidelines for sprint ceremonies, planning processes, and artifact management.

## Product Owner
**Name**: Harsh Kathrotiya
**ID**: 202412036

## Sprint Framework
- **Sprint Duration**: 2 weeks
- **Team Size**: 5-7 members
- **Daily Standup**: 15 minutes, same time daily
- **Planning Meeting**: First day of sprint, 2-3 hours
- **Review Meeting**: Last day of sprint, 1-2 hours
- **Retrospective**: Last day of sprint, 1 hour

## Current Status Update (October 11, 2025)
- Backend development for all sprints is complete
- Frontend development is in progress across all sprint goals
- Focus shifted to frontend-backend integration
- Preparing for Mid-Semester Demonstration (Due: Oct 14, 2025)

## Sprint Ceremonies

### Sprint Planning
**Participants**: Entire development team, Product Owner, Scrum Master
**Duration**: 2-3 hours for 2-week sprint
**Agenda**:
1. Review of previous sprint outcomes
2. Product Owner presents sprint goals
3. Team reviews and clarifies user stories
4. Estimation and commitment discussion
5. Task breakdown and assignment

### Daily Standup
**Participants**: Development team, Scrum Master
**Duration**: 15 minutes
**Format**:
1. What did I accomplish yesterday?
2. What will I work on today?
3. Are there any impediments?

### Sprint Review
**Participants**: Development team, Product Owner, Stakeholders
**Duration**: 1-2 hours
**Agenda**:
1. Demonstration of completed features
2. Feedback collection from stakeholders
3. Review of sprint goals achievement
4. Discussion of next steps

### Sprint Retrospective
**Participants**: Development team, Scrum Master
**Duration**: 1 hour
**Focus Areas**:
1. What went well?
2. What could be improved?
3. Action items for next sprint

## Artifact Management

### Product Backlog
- Maintained by Product Owner
- Prioritized continuously
- Refined regularly with the team
- Contains user stories with acceptance criteria

### Sprint Backlog
- Created during sprint planning
- Owned by the development team
- Contains committed user stories
- Updated daily with task progress

### Increment
- Potentially shippable product increment
- Meets Definition of Done
- Reviewed during sprint review

## Planning Process

### Preparation
1. Product Owner grooms the backlog
2. Stories are estimated using story points
3. Technical spikes identified for complex features
4. Dependencies mapped and addressed

### During Planning
1. Review sprint goal and capacity
2. Select stories from product backlog
3. Break down stories into tasks
4. Assign tasks to team members
5. Identify risks and mitigation plans

### Commitment Guidelines
- Based on team velocity from previous sprints
- Consider team availability (vacations, meetings)
- Account for technical debt and maintenance
- Include time for learning and innovation

## Definition of Ready
A user story is ready for sprint planning when:
- Clearly written with acceptance criteria
- Estimated by the team
- Dependencies identified and resolved
- UI/UX designs available if needed
- Technical approach clarified

## Definition of Done
A user story is considered complete when:
- All acceptance criteria are met
- Code is reviewed and approved
- Unit tests written and passing
- Integration tests passing
- Deployed to staging environment
- Documentation updated if needed
- Product Owner accepts the feature

## Current Sprint Goals

### Sprint 1: Foundation
**Goal**: Establish core platform infrastructure and basic user functionality
**Stories**:
- US-001: User Registration
- US-002: User Login
- US-003: Password Reset
- Setup development environment
- Database schema design
- API endpoint framework

### Sprint 2: Service Discovery
**Goal**: Enable customers to browse and discover services
**Stories**:
- US-004: View Service Categories
- US-006: Provider Create Service Listing
- US-007: Customer Browse Service Listings
- US-008: Customer View Service Details
- Image upload functionality
- Basic search implementation

### Sprint 3: Booking & Payments
**Goal**: Implement core booking and payment workflows
**Stories**:
- US-009: Customer Book Service
- US-011: Customer Make Payment
- US-010: Provider Manage Bookings
- Payment gateway integration
- Booking calendar functionality

### Sprint 4: Community & Trust
**Goal**: Build trust through reviews and ratings
**Stories**:
- US-013: Customer Leave Review
- US-014: View Reviews
- US-019: Receive Booking Notifications
- Email notification system
- Rating calculation and display

### Sprint 5: Administration
**Goal**: Provide administrative capabilities for platform management
**Stories**:
- US-005: Admin Manage Categories
- US-015: Admin View Analytics
- US-016: Admin Manage Users
- Dashboard UI implementation
- Reporting functionality

## Velocity Tracking
- Initial estimated velocity: 20-25 story points per sprint
- Will adjust based on actual performance
- Factors affecting velocity: team size, complexity, technical debt

## Risk Management
**Technical Risks**:
- Payment gateway integration challenges
- Scalability concerns with image storage
- Real-time booking conflict resolution

**Process Risks**:
- Inadequate story refinement leading to scope creep
- Insufficient testing causing quality issues
- Dependency delays affecting sprint commitments

**Mitigation Strategies**:
- Regular spike investigations for complex features
- Continuous integration and automated testing
- Cross-training team members to reduce bottlenecks