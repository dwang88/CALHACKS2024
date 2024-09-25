FROM node:20-alpine as build-step
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY frontend/.env frontend/package.json frontend/package-lock.json frontend/tsconfig.json frontend/proxy.js ./
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm install
RUN npm run build

FROM python:3.9
WORKDIR /app
COPY --from=build-step /app/build ./build

RUN mkdir ./api
COPY backend/requirements.txt backend/main.py backend/server.py backend/start.sh .env ./api/
RUN pip install -r ./api/requirements.txt
ENV FLASK_ENV=production

EXPOSE 3000  
WORKDIR /app/api
CMD ["sh", "start.sh"]