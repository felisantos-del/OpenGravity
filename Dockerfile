# Use Node.js 20 base image (full version for stability)
FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install dependencies and Puppeteer required libs
RUN apt-get update && apt-get install -y \
    libgbm-dev \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    && npm install

# Copy local code to the container image.
COPY . .

# Build the project (if necessary, tsx handles it but for prod we might want to transpile)
# For now, we'll use tsx to run directly as in dev, or we could add a build step.
# Let's keep it simple for now and use tsx in production too, or transpile to JS.
# Given the current setup, tsx is easiest.

# Expose the port for the health check
EXPOSE 8080

# Run the web service on container startup.
CMD [ "npm", "start" ]
