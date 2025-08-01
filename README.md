<!--
{
  "scripts": {
    "docker:dev:build": "docker build --target development -t z-news-dev .",
    "docker:dev:start": "npm run docker:dev:build && docker run -it --rm -p 3000:3000 -p 9229:9229 --name z-news-dev-container z-news-dev",
    "docker:dev:logs": "docker logs -f z-news-dev-container",
    "docker:dev:stop": "docker stop z-news-dev-container || true",
    "docker:dev:restart": "npm run docker:dev:stop && npm run docker:dev:start",
    "docker:prod:build": "docker build --target production -t z-news-prod .",
    "docker:prod:start": "npm run docker:prod:build && docker run -d --name z-news-prod-container -p 3000:3000 z-news-prod",
    "docker:prod:logs": "docker logs -f z-news-prod-container",
    "docker:prod:stop": "docker stop z-news-prod-container && docker rm z-news-prod-container || true",
    "docker:prod:restart": "npm run docker:prod:stop && npm run docker:prod:start",
    "docker:compose:up": "docker-compose -f docker-compose.yml up -d --build",
    "docker:compose:down": "docker-compose -f docker-compose.yml down",
    "docker:compose:logs": "docker-compose -f docker-compose.yml logs -f"
  }
}
-->

# Z NEWS
