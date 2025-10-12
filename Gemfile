source "https://rubygems.org"

# Use GitHub Pages gem which includes Jekyll and all dependencies
gem "github-pages", group: :jekyll_plugins

# Additional plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:windows]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions
# do not have a Java counterpart in JRuby and default to the C implementation.
# See https://github.com/jruby/jruby/issues/4861
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]
