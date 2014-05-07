var zlib = require('zlib');
var through2 = require('through2');

module.exports = function() {
	var gunzip = zlib.createGunzip();
	var buffer = [];
	var callback;

	var writeRaw = function(chunk, enc, cb) {
		cb(null, chunk);
	};

	var writeGunzip = function(chunk, enc, cb) {
		if (buffer) {
			buffer.push(chunk);
			callback = cb;
		}

		gunzip.write(chunk, enc, function(err) {
			if (err) return cb(err);

			var data;
			while ((data = gunzip.read())) {
				transform.push(data);
				buffer = null;
			}

			cb();
		});
	};

	gunzip.once('error', function() {
		write = writeRaw;
		while (buffer.length) transform.push(buffer.shift());
		buffer = null;
		return callback();
	});

	var write = writeGunzip;
	var transform = through2(function(chunk, enc, cb) {
		write(chunk, enc, cb);
	});

	return transform;
};
