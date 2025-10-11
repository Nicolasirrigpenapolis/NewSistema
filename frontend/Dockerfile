# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps || npm install
COPY . .
RUN npm run build

# Runtime stage (Nginx)
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Default nginx.conf already serves static, add basic cache headers if desired
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
