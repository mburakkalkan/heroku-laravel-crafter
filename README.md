# Heroku Laravel Crafter

**Heroku Laravel Crafter** is a simple command line tool for easy creation of a Laravel project and deployment on Heroku.

It automatically creates a Laravel app, then does all the jobs required for deployment to Heroku.

---

:star: **Features**:
- Always uses latest and fresh version of Laravel
- Automatically creates the Heroku app with the name you provide
- Adds free plan Heroku PostgreS and Heroku Redis addons
- Adds heroku/php, heroku/nodejs and [heroku-buildpack-locale](https://elements.heroku.com/buildpacks/heroku/heroku-buildpack-locale) buildpacks (locale buildpack is very useful for OS regional settings, timezone etc.)
- Generates Procfile for Laravel
- Applies the optimized [best practices](https://devcenter.heroku.com/articles/getting-started-with-laravel#best-practices)
- Patches the app/Http/Middleware/TrustProxies.php for Heroku
- Automatically sets environment variables for Heroku

---

:warning: **Requirements**
* Latest version of Heroku CLI
* The minimum version of PHP which the latest version of Laravel requires
* Latest version of Laravel installer: `composer global require laravel/installer`

---

:gear: **Installation**
* `npm install -g heroku-laravel-crafter`

---

:fire: **Usage**
* `heroku login`
* `heroku-laravel-create <your-app-name> --ui=vue --auth=yes --region=eu --locale=tr_TR`


**Switches**

| Switch | Description | Default
| --- | --- | --- |
| `region` | See from `heroku regions` | `us` |
| `locale` | Your localization code | `en_US` |
| `ui` | Laravel UI scaffolding framework (`none`, `bootstrap`, `vue`, `react`) | `vue` |
| `auth` | Laravel UI auth scaffolding (`yes`, `no`) | `yes` |