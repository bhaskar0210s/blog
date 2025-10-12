# My Blog

A simple, clean blog built with Jekyll and hosted on GitHub Pages.

## Features

- 🎨 Modern, responsive design
- 📱 Mobile-friendly layout
- 🚀 Fast loading static site
- 📝 Markdown-based content
- 🏷️ Tag support for posts
- 🔍 SEO optimized
- 📊 RSS feed support

## Local Development

### Prerequisites

- Ruby 3.4+ (latest version installed via Homebrew)
- Bundler gem (latest version)

**Note**: This setup uses the latest Ruby 3.4.7 and Jekyll 3.10.0 with GitHub Pages compatibility.

### Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/yourusername.github.io.git
   cd yourusername.github.io
   ```

2. **Install dependencies**:

   ```bash
   bundle install
   ```

3. **Serve locally**:

   ```bash
   # Option 1: Use the convenience script
   ./serve.sh

   # Option 2: Run directly
   bundle exec jekyll serve
   ```

4. **Visit your site**: Open [http://localhost:4000](http://localhost:4000)

### Quick Start Script

Use the included `serve.sh` script for easy development:

```bash
./serve.sh
```

This script automatically:

- Uses the correct Ruby version (3.4.7)
- Shows version information
- Starts the Jekyll server
- Opens on all interfaces (accessible from other devices on your network)

## Deployment to GitHub Pages

### Quick Start (Recommended)

Since you're encountering local build issues, the easiest way is to deploy directly to GitHub Pages:

1. **Create GitHub repository** named `yourusername.github.io`
2. **Push your files** to the repository
3. **Enable GitHub Pages** in repository settings
4. **Your site goes live** at `https://yourusername.github.io`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.

### Method 1: Automatic (Recommended)

1. Push your changes to the `main` branch
2. GitHub Pages will automatically build and deploy your site
3. Your site will be available at `https://yourusername.github.io`

### Method 2: Manual

1. Build the site locally:

   ```bash
   bundle exec jekyll build
   ```

2. Push the `_site` folder contents to your repository

## Customization

### Site Configuration

Edit `_config.yml` to customize:

- Site title and description
- Author information
- Social media links
- Plugins and settings

### Styling

- Main stylesheet: `assets/css/style.css`
- Modify colors, fonts, and layout as needed
- The design is fully responsive

### Adding Posts

1. Create new markdown files in `_posts/` directory
2. Use the naming convention: `YYYY-MM-DD-title.md`
3. Include front matter with title, date, and tags

Example:

```markdown
---
layout: post
title: "My New Post"
date: 2024-01-15 10:00:00 +0000
author: "Your Name"
tags: [tag1, tag2]
---

Your post content here...
```

### Adding Pages

Create new HTML or Markdown files in the root directory with front matter:

```markdown
---
layout: default
title: "Page Title"
---

Your page content here...
```

## File Structure

```
├── _config.yml          # Site configuration
├── _layouts/            # HTML templates
│   ├── default.html     # Default layout
│   └── post.html        # Post layout
├── _posts/              # Blog posts
├── assets/              # CSS, JS, images
│   └── css/
│       └── style.css    # Main stylesheet
├── index.html           # Homepage
├── posts.html           # All posts page
├── about.html           # About page
├── Gemfile              # Ruby dependencies
└── README.md            # This file
```

## Plugins Used

- `jekyll-feed`: Generates RSS feed
- `jekyll-sitemap`: Generates sitemap.xml
- `github-pages`: GitHub Pages compatibility

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you have questions or need help:

- Check the [Jekyll documentation](https://jekyllrb.com/docs/)
- Review [GitHub Pages documentation](https://docs.github.com/en/pages)
- Open an issue in this repository

## Acknowledgments

- Built with [Jekyll](https://jekyllrb.com/)
- Hosted on [GitHub Pages](https://pages.github.com/)
- Inspired by modern blog designs

---

Happy blogging! 🚀
