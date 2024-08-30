# vue-push

Testing Firebase Cloud Messaging from Vue PWA.

## Docker

Provided docker stack with two containers:
- vue-push: you can use this container to run npm commands like docker exec -it vue-push npm run dev
- vue-push-dist: to test the app after compiled for production.

## Project Setup

```sh
npm install
```
or
```sh
docker exec -it vue-push npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```
or
```sh
docker exec -it vue-push npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
or
```sh
docker exec -it vue-push npm run build
```
