FROM node:20.12-alpine

WORKDIR /usr/src/chatApp

# Copy package.json and package-lock.json
COPY package.json yarn.lock ./


# Install dependencies
RUN yarn install --pure-lockfile

# Copy all files
COPY . .

# Build the app
# RUN npm run build

# Start the app
CMD ["npm", "start"]