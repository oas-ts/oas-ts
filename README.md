OAS-TS
------

For the moment this is a proof of concept, following are the commands to try it.

This is a monorepo, make sure you have `lerna` installed

```
$ npm install -g lerna
```

You can download the repo, initialize the dependencies and build the project using

```
$ git clone https://github.com/oas-ts/oas-ts
$ cd oas-ts
$ lerna bootstrap
$ lerna run build
```

To run the backend example you can execute
```
$ lerna run --stream --scope rest-server-test start
```

And to try the client you can execute

```
$ lerna run --stream --scope rest-client-test start
```
