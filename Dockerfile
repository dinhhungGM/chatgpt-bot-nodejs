FROM node:19.6.0

# Set the working directory in the container to /app
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json yarn.lock ./

# Install the dependencies
RUN yarn

# Copy the rest of the application code to the container
COPY . .

# Specify the command to run the application
CMD [ "yarn", "start" ]

EXPOSE 3000