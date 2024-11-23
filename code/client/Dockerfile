# Use the official Node.js image as a base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY . .

RUN npm install

ENV DOCKER=1

# Expose port 5173 to the outside world
EXPOSE 5173

# Command to run the client application
CMD ["npm", "run", "dev"]
