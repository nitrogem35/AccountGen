const { makeHmacBody, makeHmacResult, generateSignature } = require("./x-hmac-gen.js")
const fetch = require("node-fetch")
const HttpsProxyAgent = require('https-proxy-agent')
const generate = require("boring-name-generator")

class Accounts {
    static async makeAccount(accountData) {
        /**
         * @param {Object} accountData
         * @param {String} accountData.username
         * @param {String} accountData.password
         * @param {String} accountData.email
         * If you choose to omit the username and/or password, they will be generated for you.
        */
        let username = accountData.username || this.randomUsername()
        let password = accountData.password || this.randomPassword()
        let email = accountData.email

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

        let proxyAgent = new HttpsProxyAgent("http://127.0.0.1:51080")
        /*let ip;
        lastTenMinutes.forEach((ipObj, index) => {
            if (ipObj.time < Date.now() - 600000)
                lastTenMinutes.splice(index, 1)
        })
        
        do {
            proxyAgent = proxy ? new SocksProxyAgent({ host: '127.0.0.1', port: 9050, username: Math.random().toString(16), password: Math.random().toString(16) }) : null
            ip = await fetch("https://api.ipify.org?format=json", {agent: proxyAgent}).then(res => res.json()).then(json => json.ip)
        } while (lastTenMinutes.find(ipObj => ipObj.ip == ip)) 
        
        lastTenMinutes.push({ip: ip, time: Date.now()})*/

        let resp = await fetch("https://accounts.reddit.com/api/register", {
            agent: proxyAgent,
            method: "POST",
            headers: {
                "User-Agent": `Reddit/Version 2023.29.0/Build 1059855/Android 13`,
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

    static async verify(data, proxy) {
        var resp = await fetch(`https://www.reddit.com/api/v1/verify_email/${data[0]}.json?correlation_id=${data[1]}`, {
            agent: proxy ? new HttpsProxyAgent("http://127.0.0.1:51080") : null,
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: "id=#verify-email&renderstyle=html"
        })
        var data = await resp.json()
        return data.success
    }
}

module.exports = Accounts
