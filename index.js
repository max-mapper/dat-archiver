var path = require('path')
var events = require('events')
var util = require('util')
var crypto = require('crypto')
var pump = require('pump')
var mkdirp = require('mkdirp')
var Dat = require('dat-js')
var peerNetwork = require('peer-network')

module.exports = Archiver

function Archiver (options) {
  if (!(this instanceof Archiver)) return new Archiver(options)
  var self = this
  events.EventEmitter.call(this)

  if (!options) options = {}
  if (!options.dir) throw new Error('must specify directory to store dats')
  self.options = options
  self.peers = {}
  self.servers = {}

  self.network = peerNetwork()
  self.getArchive = options.getArchive || getArchive

  function getArchive(key, cb) {
    var datDir = path.join(self.options.dir, key)
    mkdirp.sync(datDir)
    var dat = self.peers[key] = Dat({dir: datDir, discovery: false, key: key})
    dat.open(function (err) {
      if (err) return cb(err)
      console.log('dat ready')
      cb(null, dat.archive)
    })
  }
}
util.inherits(Archiver, events.EventEmitter)

Archiver.prototype.join = function (key) {
  var self = this
  if (!key) throw new Error('must specify key')
  if (self.servers[key]) throw new Error('already joined that key')
  var server = this.servers[key] = self.network.createServer()
  server.on('connection', function (stream) {
    self.emit('connection')
    readKey()
    function readKey () {
      var datKey = stream.read(32)
      if (!datKey) return stream.once('readable', readKey)
      datKey = datKey.toString('hex')
      self.emit('key-received', datKey)
      self.getArchive(datKey, function (err, archive, cb) {
        if (err) self.emit('error', err)
        self.emit('archive-replicating', datKey)
        pump(stream, archive.replicate(), stream, function (err) {
          if (err) self.emit('error', err)
          self.emit('archive-finished', datKey)
          cb()
        })
      })
    }
  })
  server.listen(key)
}
