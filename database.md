## Table `contestants`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `name` | `text` |  |
| `bio` | `text` |  Nullable |
| `color` | `text` |  |
| `tagline` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `options` | `_text` |  Nullable |
| `event_id` | `uuid` |  Nullable |
| `application_id` | `uuid` |  Nullable |
| `gradient` | `text` |  Nullable |
| `text_color` | `text` |  Nullable |

## Table `votes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `contestant_id` | `uuid` |  |
| `created_at` | `timestamptz` |  Nullable |
| `contestant_name` | `text` |  Nullable |
| `contestant_color` | `text` |  Nullable |
| `ip_address` | `text` |  Nullable |
| `user_agent` | `text` |  Nullable |
| `user_id` | `text` |  Nullable |
| `event_id` | `uuid` |  Nullable |

## Table `settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `text` | Primary |
| `voting_end` | `timestamptz` |  |

## Table `future_event_registrations`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `full_name` | `text` |  |
| `email` | `text` |  Unique |
| `phone` | `text` |  Nullable |
| `interests` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `user_id` | `text` |  Nullable |

## Table `events`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `title` | `text` |  |
| `slug` | `text` |  Unique |
| `description` | `text` |  Nullable |
| `cover_image` | `text` |  Nullable |
| `type` | `text` |  |
| `theme` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `is_featured` | `bool` |  Nullable |
| `starts_at` | `timestamptz` |  Nullable |
| `ends_at` | `timestamptz` |  Nullable |
| `voting_starts_at` | `timestamptz` |  Nullable |
| `voting_ends_at` | `timestamptz` |  Nullable |
| `max_votes_per_user` | `int4` |  Nullable |
| `allow_public_voting` | `bool` |  Nullable |
| `require_registration` | `bool` |  Nullable |
| `winner_announced` | `bool` |  Nullable |
| `created_by` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |

## Table `event_applications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `event_id` | `uuid` |  Nullable |
| `full_name` | `text` |  |
| `email` | `text` |  |
| `phone` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `portfolio_url` | `text` |  Nullable |
| `bio` | `text` |  Nullable |
| `status` | `text` |  Nullable |
| `reviewed_at` | `timestamptz` |  Nullable |
| `reviewed_by` | `text` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

## Table `contestant_images`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `contestant_id` | `uuid` |  Nullable |
| `image_url` | `text` |  |
| `sort_order` | `int4` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |

