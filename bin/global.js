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
    console.log('You can only select '.red + 'us'.cyan + ' or '.red + 'eu'.cyan + ' for region.'.red);
    process.exit(1);
}

const locale = argv.locale || 'en_US';

console.log(`
*************************************
* Welcome to Heroku Laravel Crafter *
*************************************
`.green);

console.log(`Before start, please make sure you have already logged-in to Heroku.
To login, terminate this with Ctrl+C then use '`.yellow + 'heroku login'.cyan + `'.
To continue, press enter.`.yellow);

readline.question();

console.log('Creating project directory...'.cyan);
shell.mkdir(appName);
shell.cd(appName);

console.log('Initializing git...'.cyan);
shell.exec('git init');

console.log('Creating Laravel app...'.cyan);
shell.exec('laravel new');

console.log('Adding ext-redis to dependencies...'.cyan);
shell.exec('composer require ext-redis --ignore-platform-reqs');

console.log('Patching app/Http/Middleware/TrustProxies.php for app to trust Heroku Load Balancers...'.cyan);
replace.sync({
    files: 'app/Http/Middleware/TrustProxies.php',
    from: ['$proxies;', 'HEADER_X_FORWARDED_ALL'],
    to: ['$proxies = "*";', 'HEADER_X_FORWARDED_AWS_ELB']
});

console.log('Creating Procfile...'.cyan);
fs.writeFileSync('Procfile', 'web: vendor/bin/heroku-php-apache2 public/');

console.log('Creating .locales file...'.cyan);
fs.writeFileSync('.locales', locale);

console.log('Reading .env file to obtain APP_KEY...'.cyan);
require('dotenv').config();

// process.env.APP_KEY

console.log('Creating Heroku app...'.cyan);
shell.exec(`heroku create ${appName} --region ${region}`);

console.log('Adding addons: Heroku PostgreS, Heroku Redis...'.cyan);
shell.exec('heroku addons:create heroku-postgresql:hobby-dev');
shell.exec('heroku addons:create heroku-redis:hobby-dev');

console.log('Adding buildpacks...'.cyan);
shell.exec('heroku buildpacks:add https://github.com/heroku/heroku-buildpack-locale');
shell.exec('heroku buildpacks:add heroku/php');
shell.exec('heroku buildpacks:add heroku/nodejs');

console.log('Setting Heroku environment variables...'.cyan);
shell.exec(`heroku config:set APP_NAME=${appName} APP_ENV=heroku APP_DEBUG=true APP_LOG_LEVEL=debug APP_KEY=${process.env.APP_KEY} QUEUE_CONNECTION=redis SESSION_DRIVER=redis CACHE_DRIVER=redis DB_CONNECTION=pgsql LOG_CHANNEL=stderr APP_URL=https://${appName}.herokuapp.com`);

console.log('Commiting changes...'.cyan);
shell.exec('git add .');
shell.exec('git commit -m "first commit"');

console.log('Pushing to Heroku...'.cyan);
shell.exec('git push heroku master');

console.log('Running migrations...'.cyan);
shell.exec('heroku run php artisan migrate');

console.log('Opening app...'.cyan);
shell.exec('heroku open');

console.log(`
**********************************************
* Your app is READY!                         *
* Thank you for using Heroku Laravel Crafter *
**********************************************
`.green);