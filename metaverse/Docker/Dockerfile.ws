FROM node:20-alpine AS base

FROM base as builder

RUN apk update
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

RUN npm install -g turbo
COPY . .


RUN turbo prune websocket --docker

FROM base AS installer

RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/out/json .
RUN npm install 

COPY --from=builder /usr/src/app/out/full .
RUN npm run prisma:generate
RUN npx turbo run build --filter=websocket...

FROM base AS runner
WORKDIR /usr/src/app

COPY --from=installer /usr/src/app/ .

EXPOSE 8080

CMD [ "npm", "run", "start:ws"]