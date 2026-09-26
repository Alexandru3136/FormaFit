# Forma Security Notes

This document tracks security decisions that must stay true as the app grows.

## Core Rules

- Never expose provider keys, OmniRoute keys, Stripe secrets, or auth secrets to the browser.
- Validate all user input on the server before storing or sending it to AI providers.
- Every private data request must be scoped by the authenticated user id.
- Premium access must be granted only after a verified payment webhook, not after a button click.
- Do not log passwords, payment data, API keys, private prompts, or full uploaded files.
- Admin actions must be server-checked and audit-logged.

## Planned Controls

- Auth with secure sessions.
- Password hashing if email/password auth is used.
- Rate limiting for login, AI, uploads, and payment endpoints.
- Stripe webhook signature verification.
- File type and size checks for uploads.
- Role-based access control for admin routes.
- Server-only OmniRoute client.
- Clear medical disclaimer for nutrition and workout guidance.
- Premium access checks through server-side subscription state only.
- Local development database files are ignored and must not be committed.

## AI Boundary

- Browser code must call Forma API routes, not OmniRoute directly.
- `OMNIROUTE_API_KEY` must exist only in local or deployment environment variables.
- AI routes must validate request size and shape before provider calls.
- AI responses used as structured data must be parsed and validated before persistence.
