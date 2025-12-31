FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl lm-sensors

WORKDIR /app

COPY package*.json ./

RUN npm install
#explicitly checking for express installation as it somehow didnt work for nakul
RUN npm install express 

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
