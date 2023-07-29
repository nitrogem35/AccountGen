# AccountGen
Account generator built in preparation for r/place 2024. It uses a novel g-reCaptcha v2 bypass technique, which involves sending mobile headers generated with a signing key embedded within the Reddit app itself.

The signing key currently in use by Reddit is `8c7abaa5f905f70400c81bf3a1a101e75f7210104b1991f0cd5240aa80c4d99d`.

# Installation
The account generator requires `Node.js` to run. Older versions may work, but be advised that it has only been tested on `18.17.0 (LTS)` and higher.

After cloning the repository to the root of your project folder, run `npm install` to install the required dependencies.

Once you've installed the necessary dependencies, simply run `node main.js` in your terminal to begin generating accounts.
```shell
> node main.js
Account created successfully! Username: Cowardly-Whale-1080 Password: $9hQmBgx#4CQJ1cxGoE
```

# Config
In order to avoid termination, it is recommended that these accounts are verified by email. You can do this by setting up mail on a service like [Cloudflare](https://dash.cloudflare.com/), and using a worker to send the verification emails to your own server for parsing.
The domain used for verifying these accounts can be specified in the `.env` file as `DOMAIN_NAME`.
