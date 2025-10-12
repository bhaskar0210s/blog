---
layout: post
title: "Setting Up GitHub Pages"
date: 2024-01-25 09:15:00 +0000
author: "Bhaskar"
tags: [github-pages, hosting, tutorial]
---

GitHub Pages is a fantastic way to host static websites directly from your GitHub repositories. In this post, I'll guide you through setting up GitHub Pages for your Jekyll blog.

## What is GitHub Pages?

GitHub Pages is a static site hosting service that takes HTML, CSS, and JavaScript files directly from a repository on GitHub, optionally runs the files through a build process, and publishes a website.

## Benefits of GitHub Pages

- **Free**: Host up to 1GB of content per repository
- **Custom Domains**: Use your own domain name
- **HTTPS**: Automatic SSL certificates
- **CDN**: Global content delivery network
- **Version Control**: Your site is version controlled with Git

## Setting Up Your Repository

### 1. Create a New Repository

1. Go to GitHub and click "New repository"
2. Name it `yourusername.github.io` (replace `yourusername` with your GitHub username)
3. Make it public
4. Initialize with a README

### 2. Clone and Setup

```bash
git clone https://github.com/yourusername/yourusername.github.io.git
cd yourusername.github.io
```

### 3. Enable GitHub Pages

1. Go to your repository settings
2. Scroll down to "Pages" section
3. Under "Source", select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Click "Save"

## Jekyll-Specific Setup

### 1. Add Jekyll Files

If you're using Jekyll, you'll need these files in your repository root:

- `_config.yml` - Jekyll configuration
- `_layouts/` - HTML templates
- `_posts/` - Blog posts
- `index.html` or `index.md` - Homepage

### 2. GitHub Pages Configuration

Add this to your `_config.yml`:

```yaml
# GitHub Pages specific settings
baseurl: "" # for user/organization pages
url: "https://yourusername.github.io"

# Plugins that work with GitHub Pages
plugins:
  - jekyll-feed
  - jekyll-sitemap
  - jekyll-seo-tag
```

### 3. Gemfile for GitHub Pages

Create a `Gemfile` in your repository root:

```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
end
```

## Custom Domain Setup

### 1. Add CNAME File

Create a `CNAME` file in your repository root with your domain:

```
yourdomain.com
```

### 2. DNS Configuration

Configure your DNS to point to GitHub Pages:

```
Type: CNAME
Name: www
Value: yourusername.github.io

Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

## Deployment Process

### Automatic Deployment

GitHub Pages automatically builds and deploys your site when you:

1. Push changes to the main branch
2. Merge pull requests
3. Update the `gh-pages` branch (if using that method)

### Manual Deployment

You can also build locally and push the `_site` folder:

```bash
bundle exec jekyll build
# Copy _site contents to your repository
git add .
git commit -m "Update site"
git push origin main
```

## Troubleshooting

### Common Issues

1. **Site not updating**: Check GitHub Actions tab for build errors
2. **404 errors**: Ensure `index.html` exists in root
3. **Styling issues**: Check CSS file paths
4. **Plugin errors**: Verify plugins are GitHub Pages compatible

### Build Logs

Check the "Actions" tab in your repository to see build logs and any errors.

## Best Practices

1. **Test locally**: Always test your site locally before pushing
2. **Use relative URLs**: Use `{{ site.baseurl }}` for internal links
3. **Optimize images**: Compress images for faster loading
4. **Regular updates**: Keep your dependencies updated

## Conclusion

GitHub Pages is an excellent choice for hosting static websites, especially Jekyll blogs. The setup is straightforward, and the integration with GitHub makes it perfect for developers.

Your site will be available at `https://yourusername.github.io` within a few minutes of pushing your first commit!

Happy hosting! 🌐
