FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./

# Remove lock file and install fresh (since we changed dependencies)
RUN rm -f package-lock.json && npm install --production

# Copy server source
COPY server/ .

EXPOSE 3000

CMD ["npm", "start"]