# Product Mission

## Pitch

Ravn Skills Platform (The Ledger) is an internal skills management system that helps Ravn validate and track employee technical capabilities by providing project-based skill validation through Technical Leads who work directly with team members.

## Users

### Primary Customers

- **Ravn Employees (200+):** Engineers, designers, and other technical staff who need visibility into their validated skills and career progression
- **Technical Leads:** Senior team members responsible for validating skills of people on their active projects
- **Operations/Admin Staff:** Personnel who manage the canonical skills taxonomy and oversee seniority history

### User Personas

**Software Engineer** (25-35)
- **Role:** Mid-level to Senior Developer
- **Context:** Works on multiple client projects throughout the year, building expertise in various technologies
- **Pain Points:** Resume data becomes stale quickly; skills gained on recent projects are not formally recognized; no clear visibility into career progression
- **Goals:** Have validated, up-to-date skills profile; understand what skills are recognized; see clear seniority timeline

**Technical Lead** (30-40)
- **Role:** Project Tech Lead / Engineering Manager
- **Context:** Oversees technical delivery on projects; works closely with team members daily; best positioned to evaluate actual skill levels
- **Pain Points:** No structured way to provide skill feedback; asked to validate skills for people they don't work with; validation requests pile up
- **Goals:** Quickly validate skills for their actual team members; provide accurate proficiency assessments; streamlined review process

**Operations Manager** (28-45)
- **Role:** HR/Ops Administrator
- **Context:** Needs accurate skills data for staffing decisions, resource allocation, and career development tracking
- **Pain Points:** Current skills data in ERP is unreliable; no way to verify claimed skills; seniority records are scattered
- **Goals:** Trusted source of truth for skills; clean taxonomy without duplicates; accurate seniority history

## The Problem

### Untrusted Skills Data

Ravn has 200+ employees but lacks structured, trustworthy data on what they can actually do. Resume data becomes stale immediately after hiring, and skills fields in ERPs are often unverified self-reported dumps with no standardization.

**Impact:** Staffing decisions are based on incomplete information. Project matching relies on tribal knowledge. Career progression lacks objective skill validation.

**Our Solution:** Project-Based Validation - instead of generic manager reviews, the Technical Lead of each active project validates skills for their team members. This ensures validators have direct working knowledge of the person's actual capabilities.

## Differentiators

### Context-Aware Validation

Unlike generic skills management tools where any manager can validate any employee, we route validation requests specifically to the Tech Lead who is actively working with that person on their current project.

This results in higher-quality, more accurate skill assessments because validators have firsthand knowledge of the employee's work.

### Strict Taxonomy Control

Unlike systems that allow free-text skill entry (leading to "React" vs "ReactJS" vs "React.js" fragmentation), we enforce a curated, admin-controlled skills taxonomy.

This results in clean, searchable, and consistent skills data across the organization.

### Tiered Skills Display

Unlike flat skills lists, we organize validated skills into meaningful tiers: Core Stack (current project skills), Validated Inventory (previously verified), and Pending (awaiting validation).

This results in immediate clarity about what skills are actively in use versus historically validated.

## Key Features

### Core Features

- **Employee Profile:** Clean dashboard showing validated skills (tiered by relevance), seniority timeline, and current project context
- **Validation Inbox:** Master-detail interface for Tech Leads to efficiently process skill suggestions grouped by project
- **Skill Suggestions:** Employees can self-report new skills, creating validation requests routed to appropriate Tech Leads
- **Proficiency Levels:** Four-tier proficiency system (Novice, Intermediate, Advanced, Expert) for granular skill assessment

### Administration Features

- **Skills Taxonomy Management:** Admin-controlled canonical skills list with discipline mapping (e.g., React -> Frontend)
- **Seniority History Management:** Ability to view and correct employee seniority timelines
- **Stale Data Flagging:** Automatic re-validation requests for skills not validated in 12+ months

### Integration Features

- **Mission Board Sync:** Webhook-based synchronization of People, Projects, and Assignments from Mission Board
- **Tech Lead Routing:** Automatic routing of validation requests based on project Tech Lead assignments from Mission Board
