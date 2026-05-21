# Disable email confirmation on sign up

Users can sign up and use the app **immediately** without clicking a link in their inbox.

## Supabase Dashboard (required)

1. Open your project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **Authentication** → **Providers** (or **Sign In / Providers**)
3. Click **Email**
4. Turn **OFF**:
   - **Confirm email** (sometimes labeled “Enable email confirmations”)
5. Click **Save**

## Optional: allow sign-ups

On the same page or under **Authentication** → **Settings**:

- **Enable sign ups** should be **ON**

## Test

1. Sign out in the app
2. Create a new account (or use a new email)
3. You should land on **Your Tournaments** right away — no “check your email” step

## If users already signed up with confirm ON

They must either:

- Click the confirmation link in the email, or
- In Supabase: **Authentication** → **Users** → select user → confirm manually

After you turn confirm OFF, **new** sign-ups only are instant; old unconfirmed accounts stay unconfirmed until verified.
