'use strict'

const config = require('./config.json')
const alice = require('./alice')
const kdc = require('./kdc')
const bob = require('./bob')
const symmetric = require('./symmetric')


alice.init(config.alice.address, config.alice.port, config.alice.key)
bob.init(config.bob.address, config.bob.port, config.bob.key)


// CMD|SRC|DST|PARAMS
kdc.init(config.kdc.address, config.kdc.port, config.kdc.key, config)
.then(() => {
    // alice.sendMessage(config.kdc.address, config.kdc.port, `TALK|ALICE|BOB|${symmetric.nonce()}`)
    // alice.sendMessage(config.kdc.address, config.kdc.port, `TALK|${config.alice.address}:${config.alice.port}|${config.bob.address}:${config.bob.port}|${symmetric.nonce()}`)
    bob.sendMessage(config.kdc.address, config.kdc.port, `TALK|${config.bob.address}:${config.bob.port}|${config.alice.address}:${config.alice.port}|${symmetric.nonce()}`)
})