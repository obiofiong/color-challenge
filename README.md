# Colour Challenge

Colour Challenge is a web application that allows users to vote for their favourite colour-themed photography contestant.

## Features

- Browse contestant entries
- Fullscreen image viewer
- Mobile swipe navigation
- Image zoom
- Secure voting
- Leaderboard
- Event registration
- Responsive UI

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- react-hot-toast
- Lucide React

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database

Create the required tables in Supabase:

- contestants
- votes

Configure Row Level Security (RLS) policies as needed.

## Folder Structure

```text
app/
components/
lib/
public/
```

## Main Functionality

- Display contestants
- Preview images
- Vote for a contestant
- Prevent duplicate voting
- Display leaderboard
- Register users after voting

## Future Enhancements

- Real-time leaderboard
- Admin dashboard
- Contest scheduling
- User profiles
- Analytics

## License

This project is intended for educational and event management purposes.

# Database Structure

The application uses **Supabase PostgreSQL** as its primary database. The schema is designed to support multiple events, contestants, voting, event applications, and future registrations.

## Entity Relationship Overview

```text
Events
│
├── Contestants
│     ├── Contestant Images
│     └── Votes
│
└── Event Applications
      └── Contestants (optional)

Future Event Registrations

Settings
```

---

## Tables

### 1. `events`

Stores all photography or colour challenge events.

| Column               | Type      | Description                        |
| -------------------- | --------- | ---------------------------------- |
| id                   | UUID      | Primary key                        |
| title                | Text      | Event title                        |
| slug                 | Text      | Unique URL slug                    |
| description          | Text      | Event description                  |
| cover_image          | Text      | Banner image                       |
| type                 | Text      | Event type                         |
| theme                | Text      | Event theme                        |
| status               | Text      | draft, active, completed           |
| is_featured          | Boolean   | Featured event flag                |
| starts_at            | Timestamp | Event start                        |
| ends_at              | Timestamp | Event end                          |
| voting_starts_at     | Timestamp | Voting opens                       |
| voting_ends_at       | Timestamp | Voting closes                      |
| max_votes_per_user   | Integer   | Maximum votes allowed              |
| allow_public_voting  | Boolean   | Public voting toggle               |
| require_registration | Boolean   | Require registration before voting |
| winner_announced     | Boolean   | Winner published                   |
| created_by           | Text      | Creator                            |
| created_at           | Timestamp | Created timestamp                  |
| updated_at           | Timestamp | Last updated                       |

---

### 2. `contestants`

Stores contestants participating in an event.

| Column         | Type  | Description                                |
| -------------- | ----- | ------------------------------------------ |
| id             | UUID  | Primary key                                |
| event_id       | UUID  | Related event                              |
| application_id | UUID  | Linked application (optional)              |
| name           | Text  | Contestant name                            |
| color          | Text  | Colour category                            |
| tagline        | Text  | Short slogan                               |
| description    | Text  | Contestant description                     |
| bio            | Text  | Biography                                  |
| options        | Array | Optional image list (legacy/local support) |

Relationships:

- Belongs to one Event
- May originate from one Event Application
- Has many Contestant Images
- Has many Votes

---

### 3. `contestant_images`

Stores contestant gallery images.

| Column        | Type      | Description      |
| ------------- | --------- | ---------------- |
| id            | UUID      | Primary key      |
| contestant_id | UUID      | Contestant       |
| image_url     | Text      | Image URL        |
| sort_order    | Integer   | Display order    |
| created_at    | Timestamp | Upload timestamp |

Relationship:

- Many images belong to one contestant.

---

### 4. `votes`

Stores all submitted votes.

| Column           | Type      | Description                   |
| ---------------- | --------- | ----------------------------- |
| id               | UUID      | Primary key                   |
| contestant_id    | UUID      | Contestant voted for          |
| contestant_name  | Text      | Snapshot of contestant name   |
| contestant_color | Text      | Snapshot of contestant colour |
| event_id         | UUID      | Related event                 |
| user_id          | Text      | Client/user identifier        |
| ip_address       | Text      | IP address                    |
| user_agent       | Text      | Browser information           |
| created_at       | Timestamp | Vote timestamp                |

Relationships:

- Belongs to one Event
- References one Contestant

---

### 5. `event_applications`

Stores applications submitted by prospective contestants.

| Column        | Type      | Description                 |
| ------------- | --------- | --------------------------- |
| id            | UUID      | Primary key                 |
| event_id      | UUID      | Event                       |
| full_name     | Text      | Applicant name              |
| email         | Text      | Email                       |
| phone         | Text      | Phone number                |
| instagram     | Text      | Instagram handle            |
| portfolio_url | Text      | Portfolio                   |
| bio           | Text      | Biography                   |
| status        | Text      | pending, approved, rejected |
| reviewed_at   | Timestamp | Review date                 |
| reviewed_by   | Text      | Reviewer                    |
| created_at    | Timestamp | Submission date             |

Relationship:

- Many applications belong to one Event.

Approved applications may later become contestants.

---

### 6. `future_event_registrations`

Stores users interested in future events.

| Column     | Type      | Description            |
| ---------- | --------- | ---------------------- |
| id         | UUID      | Primary key            |
| full_name  | Text      | User name              |
| email      | Text      | Email (unique)         |
| phone      | Text      | Phone number           |
| interests  | Text      | User interests         |
| user_id    | Text      | Optional identifier    |
| created_at | Timestamp | Registration timestamp |

---

### 7. `settings`

Stores global application configuration.

| Column     | Type      | Description            |
| ---------- | --------- | ---------------------- |
| id         | Text      | Configuration key      |
| voting_end | Timestamp | Global voting end time |

---

# Relationships

```text
events
│
├── contestants
│      ├── contestant_images
│      └── votes
│
└── event_applications
       │
       └── contestants (optional)

future_event_registrations

settings
```

---

# Current Application Flow

1. An administrator creates an event.
2. Participants submit applications.
3. Approved applications become contestants.
4. Contestants upload one or more images.
5. Users browse contestants.
6. Users vote once per event.
7. Votes are aggregated into a leaderboard.
8. Users can register interest in future events after voting.

---

# Future Improvements

- Supabase Authentication (Google/Microsoft SSO)
- Row Level Security (RLS) policies
- Admin dashboard
- Event scheduling
- Real-time leaderboard
- Email notifications
- Analytics dashboard
- Multi-event support
- Contestant management portal
