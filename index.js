var zlib = require('zlib');
var peek = require('peek-stream')
var through = require('through2')
var pumpify = require('pumpify')

var isCompressed = function(data) {
  if (data.length < 10) return 0 // gzip header is 10 bytes
  if (data[0] === 0x1f && data[1] === 0x8b && data[2] === 8) return 1 // gzip magic bytes
  if (data[0] === 0x78 && (data[1] === 1 || data[1] === 0x9c || data[1] === 0xda)) return 2 // deflate magic bytes
  return 0
}

var gunzip = function() {
  return peek({newline:false, maxBuffer:10}, function(data, swap) {
    switch (isCompressed(data)) {
      case 1:
        swap(null, pumpify(zlib.createGunzip(), gunzip()))
        break
      case 2:
        swap(null, pumpify(zlib.createInflate(), gunzip()))
        break
      default:
        swap(null, through())
    }
  })
}

module.exports = gunzip;