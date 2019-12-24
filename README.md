# Repo for the Digital Gold Institute website

[www.dgi.io](https://dgi.io)

## Testing your GitHub Pages site locally with Jekyll

The first time setup requires Ruby and Jekyll installation, plus:

```shell
$ gem install bundler
$ bundle install
```

Then, every time:

```shell
$ bundle exec jekyll serve
```

To preview your site, in your web browser, navigate to <http://localhost:4000>

From time to time you might want to update the GitHub Pages gem:

```shell
$ bundle update github-pages
```

See also:

- <https://jekyllrb.com/docs/installation/>
- <https://bundler.io/>
- <https://help.github.com/en/github/working-with-github-pages/testing-your-github-pages-site-locally-with-jekyll>
