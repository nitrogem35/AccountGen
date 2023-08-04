require("dotenv").config()
const WebSocket = require("ws")
const mysql = require("mysql2")
const mySQLConfig = require("./config.json")
const Accounts = require("./accounts.js")
const domain =  process.env.DOMAIN_NAME || "gmail.com"
const ratelimit = +process.env.RATELIMIT || 1000
const verificationURL = process.env.VERIFICATION_SERVER_URL || ""
const debugMode = process.env.DEBUG_MODE || false
var connection;
var accsCreating = []
var recentlyVerified = []

async function main() {
    try {
        let email = `${Math.random().toString(36).slice(2)}@${domain}`
        let account = await Accounts.makeAccount({
            email: email
        })
        let [json, username, password] = account
        switch (json.success) {
            case true:
                coloredLog(`Account created successfully! Username: ${username} Password: ${password}`, "cyan")
                return {username, password}
            case false:
                coloredLog(`Account creation failed. Reason: ${json.error.reason}`, "red")
                return null
            default:
                coloredLog("Account creation failed. Reason: Unknown", "red")
                return null
        }
    }
    catch (err) {
        coloredLog("Could not create account. Check if Tor is running.", "red")
        return null
    }
}

async function mainDBWrapper() {
    let creds = await main()
    if (creds && !debugMode) {
        accsCreating.push(creds.username)
        let query = `INSERT INTO accounts (username, password, isVerified) VALUES ('${creds.username}', '${creds.password}', 0)`
        connection.query(query, (err, result) => {
            if (err) return
            accsCreating.splice(accsCreating.indexOf(creds.username), 1)
            coloredLog(`Added ${creds.username} to database.`, "green")
        })
    }
}

async function genLoop() {
    let startTime = Date.now()
    await mainDBWrapper()
    let timeElapsed = Date.now() - startTime
    if (timeElapsed < ratelimit)
        setTimeout(genLoop, ratelimit - timeElapsed)
    else
        genLoop()
}

genLoop();

(function handleDisconnect() {
    connection = mysql.createConnection(mySQLConfig)
    connection.connect(function (err) {
        if (err) setTimeout(handleDisconnect, 2000)
    })
    connection.on('error', function (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') handleDisconnect()
        else throw err
    })
})();

(function handleSocketDisconnect() {
    let socket = new WebSocket(verificationURL)
    socket.onmessage = (e) => {
        if (!debugMode) {
            if (accsCreating.includes(e.data)) {
                let iter = 0
                let tryVerifyLoop = setInterval(() => {
                    if (!accsCreating.includes(e.data)) {
                        clearInterval(tryVerifyLoop)
                        verifyQuery(e.data)
                    }
                    if (iter >= 60) clearInterval(tryVerifyLoop)
                    iter++
                }, 500)
            }
            else verifyQuery(e.data)
        }
    }
    socket.onclose = () => {
        setTimeout(handleSocketDisconnect, 2000)
    }
    socket.onerror = () => {}
})()

async function verifyQuery(data) {
    data = JSON.parse(data)
    try {
        let isVerified = await Accounts.verify(data.verificationData, true)
        if (!isVerified) return
        let query = `UPDATE accounts SET isVerified = 1 WHERE username = '${data.username}'`
        connection.query(query, (err, result) => {
            if (err) return
            recentlyVerified.push(Date.now())
            if (recentlyVerified.length > 100) recentlyVerified.shift()
            let rate = (recentlyVerified.length / ((recentlyVerified.at(-1) - recentlyVerified[0]) / 60000)).toFixed(2)
            coloredLog(`Verified ${data.username}. (${rate} VPM)`, "purple")
        })
    }
    catch (err) {
        coloredLog(`Could not verify ${data.username}.`, "red")
        return
    }
}

function coloredLog(msg, color) {
    let colorCode;
    switch (color) {
        case "cyan":
            colorCode = "\u001b[1;36m"
            break
        case "green":
            colorCode = "\u001b[1;32m"
            break
        case "purple":
            colorCode = "\u001b[1;35m"
            break
        case "red":
            colorCode = "\u001b[1;31m"
            break
    }
    console.log(colorCode + msg + "\u001b[0m")
}
