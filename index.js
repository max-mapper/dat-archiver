var path = require('path')
var crypto = require('crypto')
var channel = require('discovery-channel')
var swarmDefaults = require('datland-swarm-defaults')
var Dat = require('dat-js')
var mkdirp = require('mkdirp')

module.exports = Archiver

function Archiver (options) {
  if (!(this instanceof Archiver)) return new Archiver(options)
  var self = this
  
  if (!options) options = {}
  if (!options.dats) throw new Error('must specify directory to store dats')
  options.dht = false
  this._discovery = channel(swarmDefaults(options))
  this._discovery.on('peer', onpeer)
  this._discovery.on('whoami', onwhoami)
  var peers = {}
  
  function onpeer (id, peer, type) {
    console.log('onpeer', id, peer, type)
    var peerkey = peer.host + ':' + peer.port
    if (peers[peerkey]) return console.log('skipping existing peer', peerkey)
    var datDir = path.join(options.dats, id.toString())
    mkdirp.sync(datDir)
    var dat = peers[peerkey] = Dat({dir: datDir})
    dat.on('ready', function () {
      console.log('dat ready')
      dat.download(function (err) {
        if (err) console.error('download err', err)
        console.log('download success')
      })
    })
    
    // this._discovery.destroy()
    // this._discovery.leave(id)
  }
  
  function onwhoami (me) {
    console.log('onwhoami', me)
    
  }
}

Archiver.prototype.join = function (key) {
  if (!key) key = crypto.randomBytes(16).toHex() // todo is this as secure as a 32 char truncated sha256
  this._discovery.join(key)
}
