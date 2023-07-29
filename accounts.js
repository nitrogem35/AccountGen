const { makeHmacBody, makeHmacResult, generateSignature } = require("./x-hmac-gen.js")
const fetch = require("node-fetch")
const SocksProxyAgent = require('socks-proxy-agent')
const generate = require("boring-name-generator")

class Accounts {
    static async makeAccount(accountData) {
        /**
         * @param {Object} accountData
         * @param {String} accountData.username
         * @param {String} accountData.password
         * @param {String} accountData.email
         * @param {Boolean} accountDate.useTor
         * If you choose to omit the username and/or password, they will be generated for you.
        */
        let username = accountData.username || this.randomUsername()
        let password = accountData.password || this.randomPassword()
        let email = accountData.email
        let proxy = accountData.useTor

        let body = JSON.stringify({
            username: username,
            password: password,
            email: email,
            newsletter_subscribe: "false"
        })

        let payload = {
            HmacBody: generateSignature(makeHmacBody(body)),
            HmacResult: generateSignature(makeHmacResult())
        }
        
        let resp = await fetch("https://accounts.reddit.com/api/register", {
            agent: proxy ? new SocksProxyAgent({ host: '127.0.0.1', port: 9050, username: Math.random().toString(16), password: Math.random().toString(16) }) : null,
            method: "POST",
            headers: {
                "User-Agent": "Reddit/Version 2023.29.0/Build 1059855/Android 13",
                "Client-Vendor-ID": "7835b1cf-38ea-4a0e-a8c6-72a72a337ab1",
                "X-Reddit-Retry": "algo=no-retries",
                "X-Reddit-Compression": 1,
                "X-Reddit-Media-Codecs": "available-codecs=video/avc, video/hevc, video/x-vnd.on2.vp9",
                "Content-Type": "application/json; charset=UTF-8",
                "Content-Length": body.length,
                "X-Hmac-Signed-Body": payload.HmacBody,
                "X-Hmac-Signed-Result": payload.HmacResult
            },
            body: body
        })
        let json = await resp.json()
        return [json, username, password]
    }

    static randomPassword() {
        let password = ""
        let chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$#"
        let pwdLength = Math.floor(Math.random() * 12) + 8
        for (let i = 0; i < pwdLength; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return password
    }

    static randomUsername() {
        let username = ""
        do {
            username = generate({ number: true, words: 2 }).spaced
        }
        while (username.length > 20)
        let uppercased = username.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join("-")
        return uppercased
    }
}

module.exports = Accounts
