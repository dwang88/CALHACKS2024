FROM node:20-alpine as build-step
WORKDIR /app

COPY package*.json ./
RUN npm install --only=production
COPY . .

# build step
RUN npm run build

RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]