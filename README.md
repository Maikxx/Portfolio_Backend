# Backend of my portfolio

Study / Learning Project - Back-end API for my portfolio website in TypeScript, Express and Node.js.

## Installing

Assuming you have [yarn](https://yarnpkg.com/en/) installed, if not, install it.

```bash
git clone git@github.com:Maikxx/Portfolio_Backend.git
cd Portfolio_Backend
yarn
```

At this point you will need to copy (on mac - OPT + Drag) the `.env.example` file and rename it to `.env`.
You will need to set the variables in the `.env` file to valid values:
* MONGO\_ATLAS\_NAME - needs to be equal to the name of your Mongo Atlas username
* MONGO\_ATLAS\_PW - needs to be equal to the name of your Mongo Atlas user password
* MONGO\_ATLAS\_CLUSTER - needs to be equal to the name of your Mongo Atlas cluster
* BASE_URL - URL where you want to serve this application, like `http://localhost:`
* PORT - port where you want to serve this application, like `8000`
* JWT_KEY - a random value of your choosing, to work as the mixer of the JWT

You will also need to create a file called `nodemon.json` in the root of this project (at the level of the `tslint.json` file).

The contents of this file need to be:
```json
{
    "env": {
        "NODE_ENV": "development"
    }
}
```

After you have done this you will need to download [Postman](https://www.getpostman.com/) and make a `POST` request to your `BASE_URL` + `PORT` + `/api/user/signup`.
You will need to send a _body_ along with your request, which is a JSON object, which has the following structure (replace the values with whatever you want your personal user to be):

```json
{
	"name": "pietje",
	"email": "pietje@example.com",
	"password": "pietje1234"
}
```

You will need to remember your password and email, since this is needed to log in from the client-side.

Once you have done all of this, you can run `yarn start-app` and along with the client-side, you are now able to navigate the website.

### Warning

Please keep in mind that this version is not very optimized in terms of image sizes, it will send a image to the client back, which is rougly the same size as the one you uploaded.

Also make sure to check the front-end code, in case you are not using the default `BASE_URL` and `PORT`. In the client these ofcourse need to correspond with those of the server.

## Bugs & issues

Please feel free to send me a mail or make a PR, if you see something that I might have overlooked.

## License

This project is licensed as [MIT](LICENSE) by [Maikel van Veen](https://github.com/Maikxx).
