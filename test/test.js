var path = require('path')
var test = require('tape')
var archiver = require('../index.js')
var createClient = require('./client.js')
var key = '8ac66b9cdc8192290e5d91133197f0cb'
var testDat = path.join(__dirname, 'cats')

test('download from local instance', function (t) {
  var arch = archiver({dats: path.join(__dirname, 'dats')})
  arch.join(key)
  
  createClient(key, testDat, function (err, client) {
    t.error(err)
    
  })
})