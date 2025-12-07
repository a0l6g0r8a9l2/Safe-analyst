## Multi-stage Dockerfile: build with Node, serve with Nginx

# --- Builder: compile the app ---
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (use package-lock if present)
COPY package.json package-lock.json* ./
# Use `npm ci` when a lockfile is present for reproducible installs,
# otherwise fall back to `npm install` so builds don't fail when a
# lockfile is not committed.
RUN if [ -f package-lock.json ]; then \
			npm ci --silent; \
		else \
			npm install --silent; \
		fi

# Copy source and build
COPY . .
RUN npm run build

# --- Production image: nginx serves the built files ---
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Use our nginx config (overrides default)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
