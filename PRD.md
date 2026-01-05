# Product Requirements Document: Ravn Skills Platform (V1)

| Metadata         | Details                                                                           |
| :--------------- | :-------------------------------------------------------------------------------- |
| **Project**      | Ravn Skills Platform (The Ledger)                                                 |
| **Version**      | 1.0 (MVP)                                                                         |
| **Status**       | **Ready for Development**                                                         |
| **Tech Stack**   | NestJS (Backend), React (Frontend), PostgreSQL (DB)                               |
| **Primary Goal** | Establish a trusted, validated source of truth for employee Skills and Seniority. |

---

## 1. Executive Summary

**The Problem:** Ravn has 200+ employees. We know _who_ they are (Mission Board), but we lack structured, trustworthy data on _what they can do_. Resume data is stale, and "skills" fields in ERPs are often unverified dumps.

**The Solution:** A standalone **Skills Platform** that acts as an intelligence layer on top of Mission Board. It ingests People and Projects, then provides a workflow for **Technical Leads** to validate the skills of the people working on their projects.

**Key Mechanism:** "Project-Based Validation." Instead of a generic manager reviewing skills, the Tech Lead of the active project receives the suggestions for their team members.

---

## 2. User Roles

| Role               | Responsibility                                                                                             |
| :----------------- | :--------------------------------------------------------------------------------------------------------- |
| **Employee**       | View their own Profile (Skills + Timeline). Self-report new skills (creates a Suggestion).                 |
| **Technical Lead** | The Primary Validator. Receives suggestions for members of their active projects. Approves/Rejects skills. |
| **Admin/Ops**      | Manages the Taxonomy (Canonical Skills List). Manages global Seniority history.                            |
| **System (Sync)**  | Background process that keeps People, Projects, and Assignments mirrored from Mission Board.               |

---

## 3. Core Functional Requirements

### 3.1 The Employee Profile (The "Read" View)

_Based on the provided design reference: A clean, card-based dashboard._

- **FR-001 (Header):** Display Name, Current Role (e.g., "Senior UI/UX Designer"), and Contact Info (synced from MB).
- **FR-002 (Seniority Timeline):** A visual list/graph showing career progression.
  - _Data:_ `Role` + `Start Date` -> `End Date`.
  - _Example:_ Junior (2020-2021) → Mid (2021-Present).
- **FR-003 (Skills - Tiered Display):**
  - **Core Stack:** Skills mapped to **current active assignments**. (High visibility).
  - **Validated Inventory:** Other skills verified in the past. (List view).
  - **Pending:** Skills waiting for validation.
- **FR-004 (My Leaders):** A sidebar section showing "Who validates me?" based on current project assignments.

### 3.2 The Validation Inbox (The "Write" View)

_A "Master-Detail" interface designed for rapid processing by Tech Leads._

- **FR-005 (The Sidebar - Project Grouping):**
  - Display a list of **People** requiring attention.
  - **Grouped by Project.** (e.g., _Project Alpha_ -> _John, Sarah_).
  - _Logic:_ Only show projects where the Logged-In User is the `Tech Lead`.
- **FR-006 (The Detail View - Person Centric):**
  - When a person is selected, show their "Review Card."
  - Display context: "Currently on Project Alpha (Backend)."
- **FR-007 (Suggestion Resolution):**
  - Display list of **Suggestions** (New skills) and **Re-validation Flags** (Old skills).
  - **Actions:** [Approve] (Update DB), [Adjust Level] (Edit & Save), [Reject] (Delete).
- **FR-008 (Navigation):** Next/Previous buttons to move through the team without going back to the list.

### 3.3 Suggestions & Validation Logic

- **FR-009 (Strict Taxonomy):** Users _cannot_ type free text. They must select from the Admin-defined Skill List (e.g., "React", not "ReactJS").
- **FR-010 (Discipline Mapping):**
  - Admin defines `default_discipline` for skills (React -> Frontend).
  - When an Assignment is synced from MB with a tag "React", the system infers the user is on the "Frontend" roster.
- **FR-011 (Stale Data Logic):** If a "Core Skill" (used on assignment) hasn't been validated in >12 months, system creates a "Re-validate" item in the Tech Lead's inbox.

### 3.4 Ingestion & Sync (Mission Board Integration)

- **FR-012:** System exposes an endpoint `POST /webhooks/sync` to receive data from MB.
- **FR-013:** Updates `Projects`, `Assignments`, and `People`.
- **FR-014:** If a Project has a `Technical Lead` defined in MB, that relationship is stored to power the Validation Inbox.

---

## 4. Technical Architecture (MVP)

### 4.1 Tech Stack

- **Project Type:** Monorepo with two apps: `web` (frontend) and `api` (backend).
- **apps/web:** React + TanStack Router + Tailwind CSS + Zustand + Apollo Client (GraphQL).
- **apps/api:** NestJS (Modules, Controllers, Services) + Prisma ORM + GraphQL.
- **Database:** PostgreSQL.
- **Auth:** JWT with automatic refresh token handling.
- **Full-stack TypeScript:** Consistent types across apps (frontend and backend).

### 4.2 Database Schema (Prisma)

```prisma
// 1. PEOPLE & HISTORY
model Profile {
  id              String   @id @default(uuid())
  mb_user_id      String   @unique // Mission Board ID
  name            String
  avatar_url      String?
  current_role    String   // "Senior Engineer"

  skills          EmployeeSkill[]
  seniority       SeniorityHistory[]
  suggestions     Suggestion[]    // Suggestions ABOUT this person
  assignments     Assignment[]

  // Inverse relation: Projects where this person is the Tech Lead
  led_projects    Project[]
}

model SeniorityHistory {
  id          Int       @id @default(autoincrement())
  profile_id  String
  role        String    // "Mid-Level Engineer"
  start_date  DateTime
  end_date    DateTime? // Null = Current

  profile     Profile   @relation(fields: [profile_id], references: [id])
}

// 2. CONTEXT (Synced from MB)
model Project {
  id              String   @id // MB Project ID
  name            String
  tech_lead_id    String?  // MB User ID

  tech_lead       Profile? @relation(fields: [tech_lead_id], references: [mb_user_id])
  assignments     Assignment[]
}

model Assignment {
  id              String   @id // MB Assignment ID
  profile_id      String
  project_id      String
  tags            String[] // ["React", "Backend"]

  project         Project @relation(fields: [project_id], references: [id])
  profile         Profile @relation(fields: [profile_id], references: [id])
}

// 3. TAXONOMY (Strict)
model Skill {
  id                 Int      @id @default(autoincrement())
  name               String   @unique
  default_discipline String?  // "Frontend"
}

// 4. THE LEDGER
model EmployeeSkill {
  profile_id         String
  skill_id           Int
  proficiency        String   // Enum: NOVICE, INTERMEDIATE, ADVANCED, EXPERT
  last_validated_at  DateTime @default(now())
  last_validated_by  String?  // ID of Tech Lead

  @@id([profile_id, skill_id])
}

// 5. THE INBOX
model Suggestion {
  id              Int      @id @default(autoincrement())
  profile_id      String   // Who is this about?
  skill_id        Int
  proficiency     String
  source          String   // "SELF_REPORT", "SYSTEM_FLAG"
  status          String   // "PENDING", "APPROVED", "REJECTED"
}
```

---

## 5. API Surface (NestJS Controllers)

### `SyncController` (Internal/Webhook)

- `POST /sync/full`: Accepts JSON dump of Projects, Assignments, People. Upserts data.

### `InboxController` (For Tech Leads)

- `GET /inbox`: Returns the hierarchical list:
  ```json
  [
    {
      "projectId": "123",
      "projectName": "Alpha",
      "members": [{ "profileId": "abc", "name": "John", "suggestionCount": 2 }]
    }
  ]
  ```
- `POST /inbox/resolve`: Accepts batch decisions.
  ```json
  {
    "profileId": "abc",
    "decisions": [
      {
        "suggestionId": 10,
        "action": "APPROVE",
        "finalProficiency": "ADVANCED"
      }
    ]
  }
  ```

### `ProfileController`

- `GET /profile/:id`: Returns Full details + Timeline + Skills (Tiered).
- `POST /profile/self-report`: Create a suggestion for yourself.

### `AdminController`

- `POST /skills`: Add new canonical skill.
- `PUT /profile/:id/seniority`: Manually fix/update seniority timeline.

---

## 6. Implementation Roadmap

- Sprints should be iterative, improving the product with each iteration.
- Each sprint must deliver a functional improvement on both the frontend (/apps/web) and backend (/apps/api).
