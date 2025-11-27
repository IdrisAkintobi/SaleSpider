# SaleSpider Documentation

This directory contains the VitePress-powered documentation website for SaleSpider.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
cd docs
npm install

# Start development server
npm run docs:dev
```

The documentation site will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Structure

```
docs/
├── .vitepress/          # VitePress configuration
│   └── config.mts       # Site configuration
├── deployment/          # Deployment guides
├── configuration/       # Configuration references
├── operations/          # Operations guides
├── features/            # Feature documentation
├── development/         # Development guides
├── index.md             # Homepage
└── getting-started.md   # Getting started guide
```

## Writing Documentation

### Markdown Features

VitePress supports enhanced Markdown features:

#### Custom Containers

```md
::: info
This is an info box.
:::

::: tip
This is a tip.
:::

::: warning
This is a warning.
:::

::: danger
This is a dangerous warning.
:::
```

#### Code Groups

````md
::: code-group

```bash [npm]
npm install
```
````

```bash [yarn]
yarn install
```

:::

````

#### Line Highlighting

```md
```js{1,4-6}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
````

````

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

```bash
# Build the site
npm run docs:build

# The built files will be in .vitepress/dist
# Deploy this directory to your hosting provider
````

## Contributing

When adding new documentation:

1. Create the markdown file in the appropriate directory
2. Add the page to the sidebar in `.vitepress/config.mts`
3. Test locally with `npm run docs:dev`
4. Submit a pull request

## Links

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Guide](https://www.markdownguide.org/)
- [SaleSpider Repository](https://github.com/IdrisAkintobi/SaleSpider)
