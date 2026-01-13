# Supabase Edge Functions Setup

This directory contains Supabase Edge Functions for the Hottest 100 app.

## Prerequisites

1. Install the Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Login to Supabase CLI:
```bash
supabase login
```

## Deploying the Profile Generator Function

### 1. Link your Supabase project

First, link your local project to your Supabase project:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project ref in your Supabase project URL:
`https://YOUR_PROJECT_REF.supabase.co`

### 2. Set the Anthropic API key as a secret

The edge function needs your Anthropic API key stored as a secret in Supabase:

```bash
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Replace `your_anthropic_api_key_here` with your actual Anthropic API key.

### 3. Deploy the function

Deploy the generate-profile function:

```bash
supabase functions deploy generate-profile
```

### 4. Verify deployment

You can test the function is working by checking the Supabase Dashboard:
- Go to your project in https://supabase.com/dashboard
- Navigate to Edge Functions
- You should see `generate-profile` listed
- Click on it to view logs and test

## Testing locally (Optional)

To test the function locally before deploying:

```bash
# Start the local Supabase stack
supabase start

# Serve the function locally
supabase functions serve generate-profile --env-file .env.local
```

Create a `.env.local` file in the root with:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Troubleshooting

### Function not responding
- Check the Edge Function logs in Supabase Dashboard
- Verify the ANTHROPIC_API_KEY secret is set correctly
- Ensure your Supabase project is on a paid plan (Edge Functions require a paid plan for production use)

### CORS errors
- The function includes CORS headers for `Access-Control-Allow-Origin: *`
- If you need to restrict origins, update the CORS headers in `generate-profile/index.ts`

### API key errors
- Verify your Anthropic API key is valid
- Check you have sufficient credits in your Anthropic account
- Confirm the secret is set: `supabase secrets list`
