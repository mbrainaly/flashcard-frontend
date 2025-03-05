# Deploying AIFlash to Vercel

This guide provides step-by-step instructions for deploying the AIFlash frontend application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your backend API deployed and accessible (e.g., on Heroku, Railway, Render, etc.)
3. Git repository with your code

## Deployment Steps

### 1. Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the "frontend" directory as the root directory

### 2. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

- `NEXT_PUBLIC_API_URL`: Your deployed backend API URL
- `NEXTAUTH_URL`: Your Vercel app URL (e.g., https://aiflash.vercel.app)
- `NEXTAUTH_SECRET`: A secure random string for NextAuth
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### 3. Deploy Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Post-Deployment

1. Verify that your application is working correctly
2. Check that API calls are being made to your backend
3. Test authentication flows
4. Verify Stripe integration

## Troubleshooting

- If you encounter build errors, check the Vercel build logs
- Ensure all environment variables are correctly set
- Verify that your backend API is accessible from your Vercel deployment

## Updating Your Deployment

Any new commits to your main branch will automatically trigger a new deployment on Vercel.

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain and follow the instructions to configure DNS settings 