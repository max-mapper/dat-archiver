#!/usr/bin/env node
var path = require('path')
var crypto = require('crypto')
var args = require('minimist')(process.argv.slice(2))

var Archiver = require('./index.js')

var defaultDir = path.join(process.cwd(), 'dats')
var archiver = Archiver({dir: args.dir || defaultDir})
var key = args._[0] || crypto.randomBytes(16).toString('hex')
archiver.join(key)
console.log('Created archiver server:', key)

archiver.on('connection', function (key) {
  console.log('New Connection on server:', key)
})

archiver.on('archive-replicating', function (key) {
  console.log('Archive replication starting:', key)
})

archiver.on('archive-finished', function (key) {
  console.log('Archive finished replicating:', key)
})
