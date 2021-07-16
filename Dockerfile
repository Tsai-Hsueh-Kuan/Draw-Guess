FROM node

WORKDIR /workspace

COPY . .

# RUN npm install --production

RUN npm install

RUN npm install pm2 -g

# RUN npm install --save-dev mocha chai

EXPOSE 3000

CMD ["pm2-runtime", "app.js"]
