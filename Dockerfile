FROM node:20.12.1

RUN mkdir -p /app
WORKDIR /app
ADD . /app/

RUN rm package-lock.json || true
RUN npm install

RUN npm run build
RUN npm install -g http-server

ENV HOST 0.0.0.0
EXPOSE 3000

CMD [ "http-server", "dist", "-p", "3000" ]