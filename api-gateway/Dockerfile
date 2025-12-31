FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl lm-sensors

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
