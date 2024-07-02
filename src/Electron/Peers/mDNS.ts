import { readConfig } from "../Configuration/configuration"

const mDNS = require('multicast-dns')()

const config = readConfig()

mDNS.on('response', function (response: any) {
    if (!response || !response.answers || !response.answers[0] || !response.answers[0].name.includes(config.appIdentifier))
        return

    console.log('got a response mDNS packet:', JSON.stringify(response?.answers, undefined, 4))
})

mDNS.on('query', function (query: any) {
    if (!query.questions[0] || !query.questions[0].name.includes(config.appIdentifier) || query.questions[0].name === config.appName)
        return

    console.log('got a query mDNS packet:', JSON.stringify(query?.questions, undefined, 4))

    mDNS.respond([{ name: config.appName, type: 'SRV', data: { target: config.ip, port: Number(config.port) } }])
})

export { mDNS }
