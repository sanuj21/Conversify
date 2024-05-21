FROM node:20.12-alpine

# Working directory
WORKDIR /usr/src/chatApp

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy all files
COPY . .

# Build the app
# RUN npm run build

# Start the app
CMD ["npm", "run", "dev"]

