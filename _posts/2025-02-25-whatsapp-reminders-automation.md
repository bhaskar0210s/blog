---
layout: post
title: "WhatsApp Reminders: Automated Scheduling with TypeScript and GitHub Actions"
date: 2026-02-25 00:00:00 -0000
categories: [Automation, TypeScript]
image: /assets/images/stats/Whatsapp Reminders.jpg
---

## Introduction

WhatsApp has become the default communication channel for many families, teams, and communities. Yet coordinating recurring tasks—birthday wishes, chore rotations, bill reminders, or weekend plans—often falls through the cracks. **WhatsApp Reminders** is a lightweight, fully automated system that sends scheduled text messages and polls to WhatsApp groups or individual chats, powered by TypeScript and GitHub Actions.

This post walks through the architecture, implementation details, and how to set up your own reminder automation.

## Project Overview

The system is driven by a single configuration file: `reminder.json`. All schedules, reminder text, poll options, and target chat mappings live there. No database, no cron server, no cloud functions—just a JSON file and a GitHub Action that runs on a schedule.

### Key Features

- **Two reminder types**: Plain text messages and interactive polls
- **Flexible scheduling**: Daily, weekly, monthly, and yearly schedules
- **Template placeholders**: Dynamic content with `{{date}}`, `{{weekday}}`, `{{time}}`, and more
- **Multiple targets**: Send to different groups or individual chats via env-based configuration
- **Mentions support**: Tag specific phone numbers in text reminders
- **Timezone-aware**: All scheduling respects a configured timezone (e.g., `Asia/Kolkata`)

## Architecture

### High-Level Flow

```
reminder.json  →  send-reminders.ts  →  Whapi API  →  WhatsApp
       ↑                    ↑
   (config)         (GitHub Actions)
```

1. **Configuration**: `reminder.json` defines reminders, schedules, and targets
2. **Runner**: `send-reminders.ts` loads config, evaluates what's due, and sends via Whapi
3. **Delivery**: Whapi (WhatsApp Cloud API) delivers messages to WhatsApp

### File Structure

```
whatsapp-reminders/
├── reminder.json              # Single source of truth
├── scripts/reminders/
│   ├── send-reminders.ts      # Main runner
│   ├── reminder-model.ts      # TypeScript types
│   ├── reminders-file.ts      # JSON parsing & validation
│   ├── scheduler.ts           # Due-date logic
│   ├── template.ts            # Placeholder substitution
│   ├── whapi-client.ts        # Whapi HTTP client
│   ├── env.ts                 # Runtime settings
│   └── list-groups.ts         # Utility to discover group IDs
└── .github/workflows/
    └── whatsapp-reminders.yml # Scheduled execution
```

## Reminder Model

Reminders are strongly typed in TypeScript. The core types:

```typescript
type ReminderType = "text" | "poll";
type WeekdayCode = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

type ReminderSchedule =
  | { kind: "daily"; time: string }
  | { kind: "weekly"; day: WeekdayCode; time: string }
  | { kind: "monthly"; day: number; time: string }
  | { kind: "yearly"; month: number; day: number; time: string };

interface TextReminder {
  id: string;
  title: string;
  type: "text";
  schedule: ReminderSchedule;
  message: string;
  target?: string;
  targetEnv?: string;
  mentionPhones?: string[];
  mentionPhoneEnvs?: string[];
}

interface PollReminder {
  id: string;
  title: string;
  type: "poll";
  schedule: ReminderSchedule;
  question: string;
  options: string[];
  target?: string;
  targetEnv?: string;
}
```

### Schedule Types

| Kind      | Parameters             | Example                    |
| --------- | ---------------------- | -------------------------- |
| `daily`   | `time`                 | Every day at 06:00         |
| `weekly`  | `day`, `time`          | Every Monday at 06:00      |
| `monthly` | `day`, `time`          | 1st of each month at 06:00 |
| `yearly`  | `month`, `day`, `time` | Feb 25 at 06:00            |

Times use 24-hour format (`HH:MM`).

## Configuration: reminder.json

The configuration file has three top-level fields:

```json
{
  "timezone": "Asia/Kolkata",
  "defaultTargetEnv": "WHAPI_GROUP_ID",
  "reminders": [ ... ]
}
```

- **timezone**: IANA timezone string for all scheduling
- **defaultTargetEnv**: Env variable name used when a reminder has no `target` or `targetEnv`
- **reminders**: Array of reminder definitions

### Example: Text Reminder (Birthday)

```json
{
  "id": "birthday-reminder-919999999999",
  "title": "Birthday Reminder - 919999999999",
  "type": "text",
  "schedule": { "kind": "yearly", "month": 2, "day": 25, "time": "06:00" },
  "target": "919999999999",
  "message": "Happy birthday! 🎉🥳"
}
```

### Example: Poll Reminder (Weekly Grocery)

```json
{
  "id": "weekly-grocery-plan",
  "title": "Weekly Grocery + Owner",
  "type": "poll",
  "schedule": { "kind": "weekly", "day": "wed", "time": "06:00" },
  "question": "Who will handle grocery shopping this weekend?",
  "options": ["I will", "Ram", "Sita", "Lakshman", "Hanuman"]
}
```

Targets can be:

- **Direct**: `"target": "919999999999"` (phone or group ID)
- **Env-based**: `"targetEnv": "FAMILY_GROUP_ID"` (reads from environment)

## Scheduler Logic

The scheduler uses `Intl.DateTimeFormat` with `formatToParts` to get timezone-aware date parts:

```typescript
export function getLocalDateParts(
  timezone: string,
  date: Date = new Date()
): LocalDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  return {
    year: toNumber(parts, "year"),
    month: toNumber(parts, "month"),
    day: toNumber(parts, "day"),
    weekday: resolveWeekday(parts),
    hour: toNumber(parts, "hour"),
    minute: toNumber(parts, "minute"),
  };
}
```

A reminder is due when:

1. **Date matches**: For weekly → weekday; monthly → day; yearly → month + day; daily → always
2. **Time matches**: Current time is within `REMINDER_DUE_TOLERANCE_MINUTES` of the scheduled time (default 2 minutes)

This tolerance handles GitHub Actions occasionally running a minute or two late.

## Template System

Text and poll content support placeholders:

| Placeholder   | Example    |
| ------------- | ---------- |
| `{{date}}`    | 2025-02-25 |
| `{{weekday}}` | Wednesday  |
| `{{month}}`   | 02         |
| `{{day}}`     | 25         |
| `{{year}}`    | 2025       |
| `{{time}}`    | 06:00      |

Implementation uses a simple regex replacement:

```typescript
export function applyTemplate(
  template: string,
  context: TemplateContext
): string {
  return template.replace(/\{\{\s*([a-zA-Z_]+)\s*\}\}/g, (_, key: string) => {
    const value = context[key as keyof TemplateContext];
    return value ?? `{{${key}}}`;
  });
}
```

## Whapi Client

The project uses [Whapi](https://whapi.cloud) as the WhatsApp gateway. The client is a thin wrapper around `fetch`:

```typescript
export class WhapiClient {
  async sendTextMessage(payload: {
    to: string;
    body: string;
    mentions?: string[];
  }): Promise<void> {
    await this.request("/messages/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: payload.to,
        body: payload.body,
        mentions: payload.mentions ?? [],
      }),
    });
  }

  async sendPoll(payload: {
    to: string;
    title: string;
    options: string[];
  }): Promise<void> {
    const form = new FormData();
    form.append("to", payload.to);
    form.append("title", payload.title);
    form.append("options", JSON.stringify(payload.options));
    await this.request("/messages/poll", { method: "POST", body: form });
  }
}
```

All requests include `Authorization: Bearer <token>`.

## GitHub Actions Workflow

The workflow runs on a cron schedule and on manual dispatch:

```yaml
name: WhatsApp Reminders

on:
  schedule:
    - cron: "0 6 * * *" # Daily at 06:00 UTC
  workflow_dispatch:

jobs:
  send_due_reminders:
    runs-on: ubuntu-latest
    environment: env
    env:
      REMINDERS_FILE: reminder.json
      REMINDER_DUE_TOLERANCE_MINUTES: "2"
      WHAPI_API_TOKEN: ${{ secrets.WHAPI_API_TOKEN || secrets.WHAPI_TOKEN }}
      WHAPI_BASE_URL: ${{ secrets.WHAPI_BASE_URL }}
      WHAPI_GROUP_ID: ${{ secrets.WHAPI_GROUP_ID }}
      FAMILY_GROUP_ID: ${{ secrets.FAMILY_GROUP_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci && npm run build
      - run: node dist/scripts/reminders/send-reminders.js
```

Required secrets:

- `WHAPI_API_TOKEN` (or `WHAPI_TOKEN`)
- `WHAPI_GROUP_ID` (default target)
- Any `targetEnv` values used in `reminder.json` (e.g., `FAMILY_GROUP_ID`)

## Local Setup

1. **Install and build**:

   ```bash
   npm install
   npm run build
   ```

2. **Configure environment** (copy `.env.example` to `.env`):

   ```
   WHAPI_API_TOKEN=your_token
   WHAPI_GROUP_ID=default_group_id
   WHAPI_BASE_URL=https://gate.whapi.cloud
   REMINDERS_FILE=reminder.json
   REMINDER_DUE_TOLERANCE_MINUTES=2
   ```

3. **Discover group IDs** (if needed):

   ```bash
   npm run reminders:list-groups
   ```

4. **Test run**:
   ```bash
   npm run reminders:run
   ```

If nothing is due at the current time, the script exits without sending.

## JSON Validation

The `reminders-file.ts` module parses and validates `reminder.json` with strict checks:

- Schedule times must be `HH:MM` in 24-hour format
- Weekly days must be `sun`–`sat`
- Monthly days: 1–31
- Yearly: month 1–12, day 1–31
- Poll options: at least 2 entries
- All required fields must be non-empty strings

Invalid JSON or schema violations throw descriptive errors.

## Takeaways

- **Single file configuration**: All reminders live in `reminder.json`—easy to version, review, and edit
- **No infrastructure**: GitHub Actions provides scheduling; no servers or databases to maintain
- **Type-safe**: TypeScript models and validation prevent configuration mistakes
- **Extensible**: New reminder types or schedule kinds can be added by extending the model and parser
- **Timezone-first**: Scheduling respects your local timezone via `Intl` APIs

WhatsApp Reminders is a minimal, maintainable way to automate recurring messages and polls. Fork it, customize `reminder.json`, add your Whapi credentials, and let GitHub Actions handle the rest.
