# Backend of my portfolio

Study / Learning Project - Back-end API for my portfolio website in TypeScript, Express and Node.js.

## Installing

```bash
git clone git@github.com:Maikxx/Portfolio_Backend.git
cd Portfolio_Backend
```

Here you will need to copy (on mac - OPT + Drag) the `.env.example` file and rename it to `.env`.
You will need to set the variables in the `.env` file to valid values:
* MONGO\_ATLAS\_NAME - needs to be equal to the name of your Mongo Atlas username
* MONGO\_ATLAS\_PW - needs to be equal to the name of your Mongo Atlas user password
* MONGO\_ATLAS\_CLUSTER - needs to be equal to the name of your Mongo Atlas cluster
* BASE_URL - URL where you want to serve this application, like `http://localhost:`
* PORT - port where you want to serve this application, like `8000`
* JWT_KEY - a random value of your choosing, to work as the mixer of the JWT