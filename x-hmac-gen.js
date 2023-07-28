const CryptoJS = require('crypto-js')
const signingKey = "8c7abaa5f905f70400c81bf3a1a101e75f7210104b1991f0cd5240aa80c4d99d"

class CryptoUtils {
    static generateSignature(payload) {
        return [
            1,
            "android",
            2,
            CryptoUtils.getSecondsSinceEpoch(),
            CryptoJS.HmacSHA256(payload, signingKey).toString(CryptoJS.enc.Hex)
        ].join(':')
    }

    static getSecondsSinceEpoch() {
        return Math.floor(Date.now() / 1000)
    }

    static makeHmacBody(body) {
        return [
            `Epoch:${CryptoUtils.getSecondsSinceEpoch()}`,
            `Body:${body}`
        ].join('|')
    }

    static makeHmacResult() {
        return [
            `Epoch:${CryptoUtils.getSecondsSinceEpoch()}`,
            `User-Agent:Reddit/Version 2023.29.0/Build 1059855/Android 13`,
            `Client-Vendor-ID:7835b1cf-38ea-4a0e-a8c6-72a72a337ab1`
        ].join('|')
    }
}

module.exports = CryptoUtils