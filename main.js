const Accounts = require("./accounts.js")
const email = "aaaaaaatest@gmail.com"
const ratelimit = 500 //Speed in milliseconds
var index = 0

async function main() {
    try {
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
        console.log("Could not create account.")
        return null
    }
}

function start() {
    console.log("Starting account generator...")
    main()
    setInterval(main, ratelimit)
}

start()
