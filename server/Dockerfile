# Use Node.js LTS version
FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the application
CMD [ "node", "src/index.js" ]