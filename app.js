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

        let initializeWithSession = [
            alice.startSession(config.kdc.address,config.kdc.port, config.bob.address, config.bob.port),
            bob.startSession(config.kdc.address,config.kdc.port, config.alice.address, config.alice.port)
        ]

        Promise.all(initializeWithSession)
        .then(keys => {
            bob.sendMessage(config.alice.address, config.alice.port, "nonses")
        })
        .catch(err => console.log(err))


    })
