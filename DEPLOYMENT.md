# Deployment Guide

Since you're encountering native extension build issues with Jekyll locally, here's how to deploy your blog directly to GitHub Pages without needing to run Jekyll locally.

## Option 1: Direct GitHub Pages Deployment (Recommended)

### Step 1: Create GitHub Repository

1. Go to GitHub and create a new repository
2. Name it `yourusername.github.io` (replace `yourusername` with your GitHub username)
3. Make it public
4. Don't initialize with README (since you already have files)

### Step 2: Push Your Blog Files

```bash
# Initialize git in your blog directory
cd /Users/bhaskars/Developer/Bhaskar/blog
git init
git add .
git commit -m "Initial blog setup"

# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"

### Step 4: Wait for Deployment

- GitHub will automatically build your Jekyll site
- Your site will be available at `https://yourusername.github.io` in a few minutes
- You can check the deployment status in the "Actions" tab

## Option 2: Use GitHub Codespaces (Alternative)

If you want to test locally, you can use GitHub Codespaces:

1. Push your code to GitHub (as in Option 1)
2. Click "Code" button in your repository
3. Select "Codespaces" tab
4. Click "Create codespace on main"
5. In the Codespace terminal, run:
   ```bash
   bundle install
   bundle exec jekyll serve --host 0.0.0.0 --port 4000
   ```

## Option 3: Update Ruby (Advanced)

If you want to run Jekyll locally, you'll need to update Ruby:

### Using Homebrew (Recommended)

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Ruby
brew install ruby

# Add to your shell profile (~/.zshrc)
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install bundler
gem install bundler

# Then try bundle install again
bundle install
```

### Using rbenv

```bash
# Install rbenv
brew install rbenv

# Install Ruby 3.1+
rbenv install 3.1.0
rbenv global 3.1.0

# Add to shell profile
echo 'eval "$(rbenv init -)"' >> ~/.zshrc
source ~/.zshrc

# Install bundler and try again
gem install bundler
bundle install
```

## Configuration Updates Needed

Before deploying, update these files with your information:

### 1. Update `_config.yml`

```yaml
title: "Your Blog Title"
description: "Your blog description"
author: "Your Name"
email: "your-email@example.com"
url: "https://yourusername.github.io" # Replace with your GitHub username
```

### 2. Update `about.html`

- Replace placeholder email and social links
- Update the about content

### 3. Update sample posts

- Edit the posts in `_posts/` directory
- Replace sample content with your own

## Troubleshooting

### GitHub Pages Build Fails

1. Check the "Actions" tab in your repository
2. Look for error messages in the build logs
3. Common issues:
   - Invalid YAML syntax in `_config.yml`
   - Missing front matter in posts
   - Plugin compatibility issues

### Site Not Updating

1. Wait 5-10 minutes for GitHub Pages to rebuild
2. Check if you're viewing the correct URL
3. Clear browser cache

### Custom Domain (Optional)

1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS to point to GitHub Pages
3. See GitHub Pages documentation for detailed instructions

## Next Steps

1. **Customize your blog**: Update colors, fonts, and layout in `assets/css/style.css`
2. **Add content**: Create new posts in `_posts/` directory
3. **Add pages**: Create new HTML/Markdown files for additional pages
4. **Configure analytics**: Add Google Analytics or other tracking
5. **Set up comments**: Consider Disqus or GitHub Issues for comments

Your blog is now ready to go live! 🚀
