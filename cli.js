#!/usr/bin/env node
var path = require('path')
var crypto = require('crypto')
var args = require('minimist')(process.argv.slice(2))

var Archiver = require('./index.js')

var defaultDir = path.join(process.cwd(), 'dats')
var archiver = Archiver({dir: args.dir || defaultDir})
var key = args._[0] || crypto.randomBytes(16).toString('hex')
archiver.join(key)
console.log(key)