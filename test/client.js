var channel = require('discovery-channel')
var swarmDefaults = require('datland-swarm-defaults')
var Dat = require('dat-js')

module.exports = function (key, dir, cb) {
  
  var dat = Dat({dir: dir})
  dat.on('ready', function (err) {
    console.log('client ready cb', err)
    if (err) return cb(err)
    dat.share(function (err) {
      console.log('client share cb', err)
      if (err) return cb(err)
      var discovery = channel(swarmDefaults({dht: false}))
      discovery.join(key, {port: 666})
      cb(null, {dat: dat, discovery: discovery})
    })
  })
}
