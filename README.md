# heroku-laravel-crafter

Automatically creates and deploys a Laravel app to Heroku with one line of command!

Installation: `npm install -g heroku-laravel-crafter`

Heroku Laravel Crafter is a simple command line tool for easy creation of a Laravel project and deployment on Heroku.

It automatically creates a Laravel app, then does all the jobs required for deployment to Heroku.

Usage: 
`heroku login`
`heroku-laravel-create <your-app-name> --region=eu --locale=tr_TR`

Features:
- Always uses latest and fresh version of Laravel
- Automatically creates the Heroku app with the name you provide
- Adds free plan Heroku PostgreS and Heroku Redis addons
- Adds heroku/php, heroku/nodejs and [heroku-buildpack-locale](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-locale) buildpacks (locale buildpack is very useful for OS regional settings, timezone etc.)
- Generates Procfile for Laravel
- Applies the optimized [best practices](https://devcenter.heroku.com/articles/getting-started-with-laravel#best-practices)
- Patches the app/Http/Middleware/TrustProxies.php for Heroku
- Automatically sets environment variables for Heroku

Laravel Installer required to run: `composer global require laravel/installer`