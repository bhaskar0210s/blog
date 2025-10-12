---
layout: post
title: "Getting Started with Jekyll"
date: 2024-01-20 14:30:00 +0000
author: "Bhaskar"
tags: [jekyll, static-site, tutorial]
---

Jekyll is a fantastic static site generator that's perfect for blogs, documentation sites, and portfolios. In this post, I'll walk you through the basics of getting started with Jekyll.

## What is Jekyll?

Jekyll is a static site generator that takes your content written in Markdown and transforms it into a complete website. It's particularly popular for blogs because:

- **Simple**: No database required
- **Fast**: Static sites load quickly
- **Secure**: No server-side vulnerabilities
- **Version Control**: Your content lives in Git

## Key Features

### Markdown Support

Write your posts in Markdown, and Jekyll handles the conversion to HTML:

```markdown
# This is a heading

This is **bold** text and this is _italic_.

- List item 1
- List item 2
```

### Liquid Templating

Jekyll uses Liquid templating language for dynamic content:

```liquid
{% for post in site.posts %}
  <h2>{{ post.title }}</h2>
{% endfor %}
```

### Collections

Organize your content into collections like posts, projects, or any custom content type.

## Getting Started

1. **Install Jekyll**:

   ```bash
   gem install jekyll bundler
   ```

2. **Create a new site**:

   ```bash
   jekyll new my-blog
   cd my-blog
   ```

3. **Serve locally**:

   ```bash
   bundle exec jekyll serve
   ```

4. **Visit your site**: Open `http://localhost:4000`

## File Structure

A typical Jekyll site has this structure:

```
my-blog/
├── _config.yml      # Configuration file
├── _layouts/        # HTML templates
├── _posts/          # Blog posts
├── _sass/           # Sass stylesheets
├── assets/          # CSS, JS, images
└── index.html       # Homepage
```

## Configuration

The `_config.yml` file controls your site's settings:

```yaml
title: "My Awesome Blog"
description: "A blog about awesome things"
baseurl: ""
url: "https://yourusername.github.io"
```

## GitHub Pages Integration

One of the best features of Jekyll is its seamless integration with GitHub Pages:

1. Push your Jekyll site to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Your site is live at `https://username.github.io/repository-name`

## Conclusion

Jekyll is an excellent choice for anyone wanting to create a simple, fast, and maintainable blog or website. Its integration with GitHub Pages makes it especially appealing for developers.

Happy blogging! 🚀
