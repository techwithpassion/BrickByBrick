# Dockerfile for package.json

# Stage 1: Build
FROM node:18-alpine as builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Run
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app .

# Install only production dependencies
RUN npm install --production

# Expose the port the Next.js application will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]