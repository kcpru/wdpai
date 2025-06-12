FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install    
COPY . .
EXPOSE 8000
CMD ["npx","nodemon","src/index.js"]
# CMD ["node","--watch","src/index.js"]