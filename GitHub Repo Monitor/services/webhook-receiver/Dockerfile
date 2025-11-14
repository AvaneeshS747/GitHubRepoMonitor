# --- STAGE 1: Build ---
# Start with an official Node.js image.
# Using 'alpine' makes the image very small and secure.
FROM node:18-alpine AS build

# Set the working directory *inside* the container
WORKDIR /app

# Copy the package.json and package-lock.json first
# This is a Docker cache optimization: if these files don't change,
# Docker will re-use the cached 'npm install' layer.
COPY package*.json ./

# Install *all* dependencies (including devDependencies)
RUN npm install

# Copy the rest of the application source code
COPY . .

# (Optional build step, if you were using TypeScript)
# RUN npm run build


# --- STAGE 2: Production ---
# Start from a fresh, even lighter base image
FROM node:18-alpine

WORKDIR /app

# Copy the package.json and package-lock.json again
COPY package*.json ./

# --- CRITICAL ---
# Install *only* production dependencies.
# This skips 'devDependencies' and makes the final image
# much smaller and more secure.
RUN npm install --production

# Copy the application code from the 'build' stage
# This copies the source code (e.g., index.js)
COPY --from=build /app .

# Expose port 8080 (the port our Express app will run on)
# This is the public-facing port that ngrok will point to.
EXPOSE 8080

# The command to run when the container starts
# This runs 'node index.js'
CMD [ "node", "index.js" ]