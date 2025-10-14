FROM node:22-alpine3.19

RUN apk add --no-cache curl  bash

WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install

COPY . .

# Start the NestJS application
EXPOSE 3001

RUN npx prisma generate

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
CMD curl -f http://localhost:3001/health || exit 1


CMD ["npm", "run", "start:dev"]
