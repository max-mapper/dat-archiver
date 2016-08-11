var path = require('path')
var crypto = require('crypto')
var pump = require('pump')
var mkdirp = require('mkdirp')
var Dat = require('dat-js')
var peerNetwork = require('peer-network')

module.exports = Archiver

function Archiver (options) {
  if (!(this instanceof Archiver)) return new Archiver(options)
  var self = this
  
  if (!options) options = {}
  if (!options.dir) throw new Error('must specify directory to store dats')
  self.options = options
  self.peers = {}
  self.servers = {}

  this.network = peerNetwork()
}

Archiver.prototype.join = function (key) {
  var self = this
  if (!key) throw new Error('must specify key')
  if (self.servers[key]) throw new Error('already joined that key')
  var server = this.servers[key] = self.network.createServer()
  server.on('connection', function (stream) {
    console.log('new connection')
    readKey()
    function readKey () {
      var datKey = stream.read(32)
      if (!datKey) return stream.once('readable', readKey)
      datKey = datKey.toString('hex')
      var datDir = path.join(self.options.dir, datKey)
      mkdirp.sync(datDir)
      var dat = self.peers[datKey] = Dat({dir: datDir, discovery: false, key: datKey})
      dat.on('ready', function () {
        console.log('dat ready')
        var replicator = dat.archive.replicate()
        pump(stream, replicator, stream, function (err) {
          if (err) throw err
          dat.close()
          console.log('done')
        })
      }) 
    }
  })
  server.listen(key)
}
