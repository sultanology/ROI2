## Install

- If not already installed, install [Node](https://nodejs.org/en/).

- If not already installed, install Bower: run the command `sudo npm -g install bower` (omit `sudo` on Windows).

- In the project directory, run `bower install`

- In the project directory, run `npm install`

## Structure

```
<project directory>/
  build/ - development build
  dist/ - production build
  node_modules/
  src/
    app/ - app logic written in Typescript
    assets/ - static files
    style/ - stylesheets written in SCSS
    templates/ - Angular partials written in Jade
    types/ - Typescript types
    index.jade - main page Jade tempate
  vendor/ - Bower packages
```

## Tasks

This uses [Gulp](http://gulpjs.com/) so you can call any of the tasks defined in the gulpfile.

The default one (run command `gulp` in project directory) watches over the files and runs the associated tasks when needed.

To build the version to distribute, run `gulp build --dist`. This will generate files in the `dist/` directory, rather than `build/` which is used for development. The `--dist` flag is also understood by the default task.
