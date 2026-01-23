FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install --production

# Bundle app source - copy everything including src directory
COPY . .

# Expose port
EXPOSE 3000

# Start the application - ensure correct path
CMD ["npm", "start"]