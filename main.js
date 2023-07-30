require("dotenv").config()
const Accounts = require("./accounts.js")
const domain =  process.env.DOMAIN_NAME || "gmail.com"
const ratelimit = +process.env.RATELIMIT || 1000 //Speed in milliseconds

async function main() {
    try {
        let email = `${Math.random().toString(36).slice(2)}@${domain}`
        let account = await Accounts.makeAccount({
            email: email,
            useTor: true
        })
        let [json, username, password] = account
        switch (json.success) {
            case true:
                console.log(`Account created successfully! Username: ${username} Password: ${password}`)
                return {username, password}
            case false:
                console.log(`Account creation failed. Reason: ${json.error.reason}`)
                return null
            default:
                console.log("Account creation failed. Reason: Unknown")
                return null
        }
    }
    catch (err) {
        console.log("Could not create account. Check if Tor is running.")
        return null
    }
}

async function genLoop() {
    let startTime = Date.now()
    await main()
    let timeElapsed = Date.now() - startTime
    if (timeElapsed < ratelimit)
        setTimeout(genLoop, ratelimit - timeElapsed)
    else
        genLoop()
}

genLoop()
