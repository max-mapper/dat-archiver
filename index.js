var path = require('path')
var events = require('events')
var util = require('util')
var pump = require('pump')
var mkdirp = require('mkdirp')
var peerNetwork = require('peer-network')
var coreArchiver = require('hypercore-archiver')

module.exports = Archiver

function Archiver (options) {
  if (!(this instanceof Archiver)) return new Archiver(options)
  if (!options) options = {}
  if (!options.dir) throw new Error('must specify directory to store dats')
  events.EventEmitter.call(this)

  var self = this
  self.options = options
  self.servers = {}
  self.network = peerNetwork()

  mkdirp.sync(path.join(options.dir, 'data'))
  self.archives = coreArchiver(options.dir)
}
util.inherits(Archiver, events.EventEmitter)

Archiver.prototype.join = function (key) {
  var self = this
  if (!key) return self.emit('error', new Error('must specify key'))
  if (self.servers[key]) return self.emit('error', new Error('already joined that key'))

  var server = self.servers[key] = self.network.createServer()
  server.on('connection', function (stream) {
    self.emit('connection', key)
    readKey()

    function readKey () {
      var datKey = stream.read(32)
      if (!datKey) return stream.once('readable', readKey)
      self.emit('key received', datKey)

      self.archives.add(datKey, function (err) {
        if (err) return self.emit('error', err)
        self.emit('replication started', datKey)
        pump(stream, self.archives.replicate(), stream, function (err) {
          if (err) return self.emit('error', err)
          self.emit('replication ended', datKey)
        })
      })
    }
  })
  server.listen(key)
}
