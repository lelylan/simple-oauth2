# Contributing

Fork the repo on github and send a pull requests with feature branches to the ```develop``` branch. Do not forget to provide tests to your contribution.

## Node version
This project is pinned to an specific node version for local development by using [volta](https://volta.sh/) as engines manager. Make sure you have it installed, to ensure your changes are tested with our recommended engine.

## Repository

* The master branch will always point to the npm latest published version.
* Develop will contain the latest development/testing/new-features changes.
* Every npm release will have a corresponding git tag. The **CHANGELOG.md** will be updated on every release too.

## Running specs

* Fork and clone the repository (`develop` branch).
* Run `npm install` for dependencies.
* Run `npm test` to execute all specs.
* Run `npm run lint` to verify that all code pass our linting rules.

## Updating the docs

Currently, the project documentation it´s on README.md file, a table of contents is generated using a tool called [doctoc](https://github.com/thlorenz/doctoc). So if you updated this file (specially if headers are modified), please use:

```bash
  npm run docs-gen
```

### Coding guidelines

To contribute to this project, please follow the [airbnb](https://github.com/airbnb/javascript) guidelines.
