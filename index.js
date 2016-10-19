var path = require('path')
var crypto = require('crypto')
var pump = require('pump')
var mkdirp = require('mkdirp')
var peerNetwork = require('peer-network')
var coreArchive = require('hypercore-archiver')

module.exports = Archiver

function Archiver (options) {
  if (!(this instanceof Archiver)) return new Archiver(options)
  var self = this

  if (!options) options = {}
  if (!options.dir) throw new Error('must specify directory to store dats')
  self.options = options
  self.servers = {}
  self.network = peerNetwork()

  mkdirp.sync(path.join(options.dir, 'data'))
  self.archives = coreArchive(options.dir)
}

Archiver.prototype.join = function (key) {
  var self = this
  if (!key) throw new Error('must specify key')
  if (self.servers[key]) throw new Error('already joined that key')
  var server = this.servers[key] = self.network.createServer()
  server.on('connection', function (stream) {
    console.log('new connection on:', key)
    readKey()
    function readKey () {
      var datKey = stream.read(32)
      if (!datKey) return stream.once('readable', readKey)
      // datKey = encoding.encode(datKey)
      self.archives.add(datKey, function (err) {
        if (err) throw err
        console.log('starting replication', datKey.toString('hex'))
        pump(stream, self.archives.replicate(), stream, function (err) {
          if (err) throw err
          console.log('done replicating')
        })
      })
    }
  })
  server.listen(key)
}
