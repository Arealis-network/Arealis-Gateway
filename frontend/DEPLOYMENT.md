# Arealis Gateway Frontend - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Your repository pushed to GitHub

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `Arealis-network/Arealis-Gateway`
4. Set the **Root Directory** to `frontend`
5. Configure environment variables (see below)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: arealis-gateway-frontend
# - Directory: ./
# - Override settings? No
```

### 3. Environment Variables

Set these in your Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_API_KEY=your_production_api_key
```

**For Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=arealis_api_key_2024
```

### 4. Build Configuration

The project is already configured with:
- ✅ Next.js 14.2.16
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ All required dependencies
- ✅ Vercel configuration (vercel.json)

### 5. Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### 6. Environment-Specific URLs

Update your backend services to allow CORS from your Vercel domain:
- Development: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

## 🔧 Troubleshooting

### Build Errors
- Check that all dependencies are in package.json
- Ensure TypeScript compilation passes locally
- Verify environment variables are set

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings on backend services
- Ensure API key is valid

### Performance
- Enable Vercel Analytics in project settings
- Use Vercel's Edge Functions for API routes if needed

## 📱 Features Included

- ✅ Landing page with hero section
- ✅ Dashboard with all demo pages
- ✅ Client portal integration
- ✅ Responsive design
- ✅ Dark/Light theme support
- ✅ All UI components and pages

## 🔄 Automatic Deployments

Once connected to GitHub:
- Every push to `main` branch triggers automatic deployment
- Preview deployments for pull requests
- Branch deployments for feature branches

## 📊 Monitoring

- Vercel Analytics (built-in)
- Real-time performance metrics
- Error tracking and logging
