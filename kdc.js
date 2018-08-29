'use strict'

const net = require('net')
var exports = module.exports = {}
const symmetric = require('./symmetric')
var sharedKeys
var kdcKey
var config

exports.init = (address, port, key, master) => {

    return new Promise(resolve => {

        net.createServer((socket) => {

            // socket.pipe(socket);

            kdcKey = key

            socket.on('data', (data, from) => {
                socket.write(processRequest(data.toString()))
            })

        }).listen(port, () => {
            console.log('\nStarted KDC!', address+':'+port)


                config = master;
                resolve(config);



        })
    })
//
}

function processRequest(request) {

    let splittedRequest = request.split('|');
    let command = splittedRequest[0].toLowerCase()

    switch (command) {

        case 'talk':

            let src = splittedRequest[1].toString()
            let dst = splittedRequest[2].toString()


            let srcKey = config.sharedKeys[ Object.keys(config).filter((user) => {
                if(config[user].hasOwnProperty('port') && config[user].hasOwnProperty('address') && config[user]['address']+":"+config[user]['port'] === src)
                    return true;
                else
                    return false;
            }) ]

            let dstKey = config.sharedKeys[ Object.keys(config).filter((user) => {
                if(config[user].hasOwnProperty('port') && config[user].hasOwnProperty('address') && config[user]['address']+":"+config[user]['port'] === dst)
                    return user;
                else
                    return false;
            }) ]


            // E( Ks | REQUEST | N1 | E( Ks | ALICE, Kb), Ka)
            return symmetric.encrypt( kdcKey+'|'+
                splittedRequest[2]+'|'+
                splittedRequest[3]+'|'+
                symmetric.encrypt(kdcKey+'|'+src, dstKey), srcKey )



    }


}

