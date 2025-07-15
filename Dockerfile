# Use the official Node.js image as the base  
FROM node:16.20-alpine3.18 as base  
# Set the working directory inside the container  
WORKDIR /app  
# Copy the app source code to the container  
COPY . .  
# Install dependencies  
RUN npm install --force yarn  
RUN yarn install
# Build the Next.js app  
RUN yarn build

EXPOSE 3000
