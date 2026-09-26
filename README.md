# Jaewon Kim — Investment Research Portfolio

A responsive, static portfolio site designed for GitHub Pages. The content follows the portfolio brief and links to the public project repositories in the portfolio index.

## Preview locally

Open index.html in a browser. The site uses no build step or JavaScript.

## Validate the site

Run npx --yes tsx src/harness.ts from this directory to check the content, internal links, public project links, privacy, and Pages workflow.

## Publish with GitHub Pages

1. Create a new repository for the site and add these files at the repository root.
2. Keep the default branch named main.
3. In the repository settings, open **Pages** and set the publishing source to **GitHub Actions**.
4. Push to main, or run **Deploy portfolio to GitHub Pages** from the Actions tab.

The workflow uploads the static site files and deploys them to the github-pages environment. The reference repository bucheoncityboy/portfolio-index is not required for deployment and is only linked as a source of project links.

## Update project links

Edit the project cards in index.html. Project links currently point to public repositories under bucheoncityboy.
