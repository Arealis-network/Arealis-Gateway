# Vercel Deployment Guide for Arealis Gateway

## Problem Fixed
The original error `npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/vercel/path0/package.json'` occurred because Vercel was looking for `package.json` in the root directory, but your apps are in subdirectories.

## Solution Implemented

### 1. Created Root package.json
- Added a monorepo structure with workspaces
- Manages both `frontend` and `client_portal` apps
- Provides unified scripts for development and deployment

### 2. Updated Vercel Configuration
- Enhanced `vercel.json` files with security headers
- Added proper API routing configuration
- Optimized build settings

## Deployment Options

### Option 1: Deploy Frontend App (Main Website)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set **Root Directory** to `frontend`
5. Vercel will automatically detect Next.js
6. Deploy

### Option 2: Deploy Client Portal App
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set **Root Directory** to `client_portal`
5. Vercel will automatically detect Next.js
6. Deploy

### Option 3: Deploy Both Apps (Recommended)
1. Deploy `frontend` as one project (Root Directory: `frontend`)
2. Deploy `client_portal` as another project (Root Directory: `client_portal`)
3. Use different domains or subdomains for each

## Vercel Project Settings

### For Frontend App:
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### For Client Portal App:
- **Root Directory**: `client_portal`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Environment Variables

Add these environment variables in Vercel dashboard:

### Frontend App:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_ENV=production
```

### Client Portal App:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_ENV=production
```

## Local Development

After the changes, you can run:

```bash
# Install dependencies for all workspaces
npm run install:all

# Run frontend app
npm run dev

# Run client portal app
npm run dev:client

# Build all apps
npm run build:all
```

## Troubleshooting

### If you still get package.json errors:
1. Make sure you set the **Root Directory** correctly in Vercel
2. Check that the `vercel.json` file is in the correct subdirectory
3. Verify that `package.json` exists in the subdirectory you're deploying

### If build fails:
1. Check Node.js version compatibility (requires Node 18+)
2. Verify all dependencies are properly installed
3. Check for TypeScript errors

## Security Features Added

- Content Security Policy headers
- XSS Protection
- Frame Options protection
- Content Type sniffing protection

## Next Steps

1. Deploy both apps to Vercel using the settings above
2. Configure custom domains if needed
3. Set up environment variables
4. Test the deployed applications
5. Configure backend API endpoints to work with Vercel URLs

The deployment should now work without the package.json error!
