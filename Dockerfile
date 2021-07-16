FROM node

WORKDIR /workspace

COPY . .

# RUN npm install --production

RUN npm install

RUN npm install pm2 -g

EXPOSE 3000

CMD ["pm2-runtime", "app.js"]
