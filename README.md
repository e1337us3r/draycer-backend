# Postaci | DRaycer Distribution Server

## Getting started
DRaycer uses Firebase service for authentication. In order to run the server you must first create a Firebase project.

## 1) Set up Firebase
Create an account, and a simple web project. Head over to your console, generate a service account key, download it(JSON preferably) and set its path as GOOGLE_APPLICATION_CREDENTIALS environment variable (example in .env.dev file).

Look [here](https://firebase.google.com/docs/admin/setup#initialize_the_sdk) for more on this.

## 2) Set up environment variables
All available env variables with their default values are provided in .env.dev file. 

Copy `.env.dev` as `.env`. You can configure `.env` as you like.

## 3) Set up required services
If you have docker-compose installed in your system, you can simply use it to run the required services.
If not, you must have redis and postgres manually installed in your system.

Inside `build` folder run:
```
docker-compose -f docker-compose.dev.yml up
```

## 4) Run the server

```
yarn dev
or
npm run dev
```

You should see a message similar to `Server listening on port ...`

Nodemon will automatically restart the server if any changes are made to code inside folder `src`.


## License
Copyright (c) 2020 DRaycer. Licensed under the MIT license.


