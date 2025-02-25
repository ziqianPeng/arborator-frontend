# arborator (arborator-frontend)

## Wiki (work in progress)

Arborator-Grew's wiki is available here: https://github.com/Arborator/arborator-frontend/wiki

This wiki will contain the full User Guide, which is currently a work-in-progress.

## Migration to quasar v2 (vue3)

### Installation

BE CAREFUL !!! CLONE THIS BRANCH IN A NEW FOLDER !
Indeed, most of the dependencies changed, so if you just chckout from your actual quasarv1 branch to this one, you will need to delete all node_modules, package-lock.json and rerun `npm install`

#### Procedure

1 - Clone in a new folder Arborator

```
git clone https://github.com/Arborator/arborator-frontend/
```

2 - checkout quasar_v2 branch

```
git checkout quasar_v2
```

3 - install node packages

```
npm install
```

It should works without any changes on the backend. So you can continue to use the same dev backend for both version of Arborator frontend

### TODO LIST

#### TS + Pinia migration
- [ ] check in AppLayout.vue that the language logic is correct
- [ ] check if styus (used in some component style) still works
- [ ] proper renaming of conll_schema/annotationFeatures/config (grew backend has config name, frontend has all of them)
- [ ] auth provider seems its a number in the db, but on backend it's typed as a string

#### Quasar v2 migration
- [ ] <URGENT> re-add lexicon import and export logic (in LexiconTableBase.vue ? before was in LexiconPanel.vue) and compareLexicon.vue
- [ ] <fix>Lexicon : have only one way to delete a feature 
- [ ] <estetic> improve estetics of our code mirror instances (font, color, font-size)
- [ ] <URGENT> Page Settings.vue (name modification doesnt work)
  ***
- [x] <fix> when refresh page, we should not be redirected to home page, but stay on the sama page
- [X] change the conll in the codemirror editor should not being apply if the new tree is unvalid
- [X] <broken>if user save a tree and has no tree yet, we have ERROR this4.$set is undefined  
- [x] fix breadcrumbs not working
- [x] <estetic> Some global app styling doesn't work (we can see a light blue instead of the purple arboragrew theme, ;aybe our stylus loader/compiler is not working. )
- [x] When importing conll files in a project, we don't see the userId convertor form
- [x] fix codemirror 2 way binding (in the differents 4 instances of CM we have)
- [x] Make statics files serving work (it doesn't work when referencing to them with `icon="img:svg/g.svg"` in a <q-btn> for instance)
- [x] Page AppLayout.vue
- [x] Page ProjectsHub.vue
- [x] Page Project.vue
- [x] Page Sample.vue
- [X] Page KlangProject.vue (same as Klang.vue above)
- [X] Page KlangSample.vue (same as Klang.vue above)
- [X] Page Klang.vue (need to provide data_dev in backend to see if working)
- [x] vue3 codemirror
- [x] vue3 local storage
- [x] vue3 cookies
- [x] vue3 i18n
- [x] vue3 Store
- [x] vue3 Router
- [x] q-table `data` property converted to `rows`
- [x] myProperty.sync converted to v-model:myProperty
- [x] dependencies up to date in package.json

Frontend for arborator draft

## Install the dependencies

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
node_modules/.bin/quasar dev
# or
npm run start
```

### Test the interface

(may be necessary to do `npm install` first)

```bash
npm run test:e2e
```

### Build the app for production

```bash
npm run buildProd
```

### Deploy a New Version

1.  Connect as Arborator (ssh arborator@arborapi.xxx.fr), then:

```
cd arborator-frontend
git pull origin master
rm -R dist
quasar build
```

2. Connect as root (ssh root@arborapi.xxx.fr), then:

```
service nginx restart
```

3. Profit. (Clean your browser cache if necessary to see the new version)

### Customize the configuration

See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).

## Test the components

### 1. Unit Testing

Before you run the api testing files you have to run the following command

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
# It's for communcation with local https server on Linux OS
```

You can use npm scripts to run your testing files

```bash
npm run test:unit # run all your testing files (*.spec.js or *.test.js, etc)
npm run test:unit:coverage # also collect coverage status of your project
npm run test:unit:watch # automatically detect changes and run test again if changed
npm run test:unit:watchAll # run all tests if changed
```

If you wanna run only one testing file, then run as the following

```bash
npm run test:unit:watch test/jest/__tests__/some_test.js
```

You can also run jest commands directly

```bash
jest --watch --coverage
```

If you get the following error when you executed the this command ` npm run test:unit:watchAll`

`Error:ENOSPC: System limit for number of file watchers reached`

then please run the following command and try again

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
