# Postaci | DRaycer Distribution Server

## Getting started
To run the development server and its services such as Postgres and Redis do the following:  

Rename `.env.dev` to `.env`. You can configure `.env` file if you like.

Inside `build` folder run:
```
docker-compose -f docker-compose.dev.yml up
```

You should see a message similar to `Server listening on port ...`

Nodemon will automatically restart the server if any changes are made to code inside folder `src`.


## License
Copyright (c) 2020 DRaycer. Licensed under the MIT license.


