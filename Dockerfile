FROM node:14

# configuration

#WORKDIR /
COPY ./app /app
VOLUME /app

# startup commands on build image
RUN cd /app && npm install

EXPOSE 80


# startup commands on image start
# dev
#CMD [ "npm", "run", "serve" ]
CMD cd /app && npm run serve

# production
# CMD [ "node", "server.js" ]




# environment
# ENV NODE_ENV production
ENV PORT 5001

ENV prova "ciao come stai"





