const Accounts = require("./accounts.js")
const email = "aaaaaatest@gmail.com"

async function main() {
    try {
        let account = await Accounts.makeAccount({
            email: email
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

main()