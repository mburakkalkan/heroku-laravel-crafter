#!/usr/bin/env node

require('colors');
const shell = require('shelljs');
const readline = require('readline-sync');
const replace = require('replace-in-file');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const appName = argv._[0];

const regions = ['us', 'eu'];
const region = argv.region || regions[0];
if (!regions.includes(region)) {
    console.log('You can only select '.brightRed + 'us'.brightCyan + ' or '.brightRed + 'eu'.brightCyan + ' for region.'.brightRed);
    process.exit(1);
}

const uis = ['none', 'bootstrap', 'vue', 'react'];
const ui = argv.ui || uis[2];
if (!uis.includes(ui)) {
    console.log('You can only select '.brightRed + 'none'.brightCyan + ', '.brightRed + 'bootstrap'.brightCyan + 'vue'.brightCyan + ', or '.brightRed + 'react'.brightCyan + ' for UI scaffolding.'.brightRed);
    process.exit(1);
}

const auths = ['yes', 'no'];
const auth = argv.auth || auths[0];
if (!auths.includes(auth)) {
    if(ui == 'none') {
        console.log('You can\'t enable auth without using UI scaffolding.'.brightRed);
    }
    else {
        console.log('You can only select '.brightRed + 'yes'.brightCyan + ' or '.brightRed + 'no'.brightCyan + ' for auth scaffolding.'.brightRed);
    }
    process.exit(1);
}

const locale = argv.locale || 'en_US';

console.log(`
*************************************
* Welcome to Heroku Laravel Crafter *
*************************************
`.brightGreen);

console.log(`Before start, please make sure you have already logged-in to Heroku.
To login, terminate this with Ctrl+C then use '`.brightYellow + 'heroku login'.brightCyan + `'.
To continue, press enter.`.brightYellow);

readline.question();

console.log('Creating Laravel app...'.brightCyan);
shell.exec(`composer create-project --prefer-dist laravel/laravel ${appName}`);
shell.cd(appName);

console.log('Initializing git...'.brightCyan);
shell.exec('git init');

if (ui != 'none') {
    console.log('Adding Laravel UI with \''.brightCyan + ui.brightYellow +'\''.brightCyan + (auth == 'yes' ? ' and auth' : '').brightCyan + '...'.brightCyan);
    shell.exec('composer require laravel/ui');
    shell.exec('php artisan ui ' + ui + (auth == 'yes' ? ' --auth' : ''));
}

console.log('Installing npm packages...'.brightCyan);
shell.exec('npm install');

console.log('Compiling assets...'.brightCyan);
shell.exec('npm run dev');

console.log('Adding Heroku ext-redis to dependencies...'.brightCyan);
shell.exec('composer require ext-redis --ignore-platform-reqs');

console.log('Patching app/Http/Middleware/TrustProxies.php for app to trust Heroku Load Balancers...'.brightCyan);
replace.sync({
    files: 'app/Http/Middleware/TrustProxies.php',
    from: ['$proxies;', 'HEADER_X_FORWARDED_ALL'],
    to: ['$proxies = "*";', 'HEADER_X_FORWARDED_AWS_ELB']
});

console.log('Creating Procfile...'.brightCyan);
fs.writeFileSync('Procfile', 'web: vendor/bin/heroku-php-apache2 public/');

console.log('Creating .locales file...'.brightCyan);
fs.writeFileSync('.locales', locale);

console.log('Reading .env file to obtain APP_KEY...'.brightCyan);
require('dotenv').config();

console.log('Creating Heroku app...'.brightCyan);
shell.exec(`heroku create ${appName} --region ${region}`);

console.log('Adding addons: Heroku PostgreS, Heroku Redis...'.brightCyan);
shell.exec('heroku addons:create heroku-postgresql:hobby-dev');
shell.exec('heroku addons:create heroku-redis:hobby-dev');

console.log('Adding buildpacks...'.brightCyan);
shell.exec('heroku buildpacks:add https://github.com/heroku/heroku-buildpack-locale');
shell.exec('heroku buildpacks:add heroku/php');

console.log('Setting Heroku environment variables...'.brightCyan);
shell.exec(`heroku config:set APP_NAME=${appName} APP_ENV=heroku APP_DEBUG=true APP_LOG_LEVEL=debug APP_KEY=${process.env.APP_KEY} QUEUE_CONNECTION=redis SESSION_DRIVER=redis CACHE_DRIVER=redis DB_CONNECTION=pgsql LOG_CHANNEL=stderr APP_URL=https://${appName}.herokuapp.com`);

console.log('Commiting changes...'.brightCyan);
shell.exec('git add .');
shell.exec('git commit -m "First commit by heroku-laravel-crafter"');

console.log('Pushing to Heroku...'.brightCyan);
shell.exec('git push heroku master');

console.log('Running migrations...'.brightCyan);
shell.exec('heroku run php artisan migrate');

console.log('Restarting dyno...'.brightCyan);
shell.exec('heroku dyno:restart');

console.log('Opening app...'.brightCyan);
shell.exec('heroku open');

console.log(`
**********************************************
* Your app is READY on Heroku!               *
* For local development, edit your .env file *
* then run 'php artisan migrate'.            *
* Thank you for using Heroku Laravel Crafter *
**********************************************
`.brightGreen);