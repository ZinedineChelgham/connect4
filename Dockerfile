FROM node
WORKDIR /app
COPY [".", "./"]
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
EXPOSE 8000
