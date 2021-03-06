FROM node:7-slim

RUN apt-get update \
  && apt-get install -y \
  bzip2 \
  git

WORKDIR /usr/src/app
COPY ["package.json", "/usr/src/app/"]
RUN npm install

COPY . /usr/src/app
ENV \
  PUBLIC_HOST=web \
  MONGOHQ_URL=mongodb://mongo/Coupling \
  MONGO_CONNECTION=mongodb://mongo \
  HEADLESS=true

CMD [ "node", "test/continuous-run.js" ]

EXPOSE 3000 8125
