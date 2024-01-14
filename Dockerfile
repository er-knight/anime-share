# FROM python:3.10-slim-bookworm as backend

# WORKDIR /app/backend

# COPY backend/requirements.txt .

# RUN pip install --no-cache-dir -r requirements.txt

# COPY backend .

# EXPOSE 8000

FROM node:18-bookworm-slim as frontend

WORKDIR /app/frontend

COPY frontend/package.json .
COPY frontend/package-lock.json .

RUN npm install

COPY frontend .

RUN npm run build

FROM nginx:1.25-bookworm

COPY --from=frontend /app/frontend/dist /usr/share/nginx/html

COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
