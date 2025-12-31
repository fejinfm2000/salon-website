# GitHub Integration Setup Guide

This guide explains how to configure GitHub integration for the Admin Dashboard CRUD operations.

## Prerequisites

- A GitHub account
- Repository with the SalonPro project
- Admin access to Netlify deployment

## Step 1: Create GitHub Personal Access Token

1. Go to GitHub Settings: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a descriptive name: `SalonPro Admin Dashboard`
4. Set expiration (recommend: 90 days or No expiration for production)
5. Select the following scope:
   - ✅ **repo** (Full control of private repositories)
6. Click **"Generate token"**
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)

## Step 2: Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to **Site settings** → **Environment variables**
4. Add the following variables:

```
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your-github-username
GITHUB_REPO=salon-website
GITHUB_BRANCH=main
```

Replace:
- `ghp_your_token_here` with your actual GitHub token
- `your-github-username` with your GitHub username
- `salon-website` with your repository name (if different)
- `main` with your branch name (if different)

## Step 3: Deploy

1. Commit and push all changes to GitHub
2. Netlify will automatically rebuild with the new functions
3. Test the CRUD operations in the admin dashboard

## Testing Locally (Optional)

To test Netlify Functions locally:

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Create `.env` file in project root:
   ```
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_OWNER=your-github-username
   GITHUB_REPO=salon-website
   GITHUB_BRANCH=main
   ```

3. Run local dev server:
   ```bash
   netlify dev
   ```

4. Access at `http://localhost:8888`

## Security Notes

- ⚠️ **Never commit** the `.env` file or expose your GitHub token
- 🔒 Environment variables in Netlify are encrypted and secure
- 🔄 Rotate tokens periodically for security
- 👤 Use a dedicated service account for production

## Troubleshooting

### "GitHub token not configured" error
- Verify environment variables are set in Netlify
- Redeploy the site after adding variables

### "Failed to update file" error
- Check token has `repo` scope
- Verify repository name and owner are correct
- Ensure branch name matches

### Changes not appearing
- Check GitHub repository for commits
- Verify the correct branch is being updated
- Clear browser cache and reload

## How It Works

1. **Admin Dashboard** → User edits content
2. **Netlify Function** → Receives API request
3. **GitHub API** → Creates/updates/deletes files
4. **Git Commit** → Changes committed to repository
5. **Netlify Build** → Automatically rebuilds site with new content
