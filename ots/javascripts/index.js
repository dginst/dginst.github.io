
/* OpenTimestamps functions */

const OpenTimestamps = window.OpenTimestamps

// an empty list would be equivalent to the default calendars
const calendarsList = [
	'https://btc.ots.dgi.io',
	'https://alice.btc.calendar.opentimestamps.org',
	'https://bob.btc.calendar.opentimestamps.org',
	'https://finney.calendar.eternitywall.com',
	//'https://ots.btc.catallaxy.com/'
]

const aggregatorList = [
	'https://btc.ots.dgi.io',
	'https://a.pool.opentimestamps.org',
	'https://b.pool.opentimestamps.org',
	'https://a.pool.eternitywall.com',
	//'https://ots.btc.catallaxy.com'
]

const whitelistedCalendars = new OpenTimestamps.Calendar.UrlWhitelist(calendarsList)

const blockexplorers = {
	bitcoin: {
		explorers: [
			{ url: 'https://blockstream.info/api', type: 'blockstream' },
			{ url: 'https://blockexplorer.com/api', type: 'insight' }
		]
	}
}

function stamp(filename, hash, hashType) {
	Document.progressStart();

	var op;
	if (hashType == "SHA1") {
		op = new OpenTimestamps.Ops.OpSHA1();
	} else if (hashType == "SHA256") {
		op = new OpenTimestamps.Ops.OpSHA256();
	} else if (hashType == "RIPEMD160") {
		op = new OpenTimestamps.Ops.OpRIPEMD160();
	} else {
		op = new OpenTimestamps.Ops.OpSHA256();
	}

	const detached = OpenTimestamps.DetachedTimestampFile.fromHash(op, hexToBytes(hash));
	const options = { calendars: aggregatorList }

	OpenTimestamps.stamp(detached, options).then(() => {
		const ctx = new OpenTimestamps.Context.StreamSerialization();
		detached.serialize(ctx);
		const timestampBytes = ctx.getOutput();
		download(filename, timestampBytes);
		Document.progressStop();
		receipt('Created (.ots) submission receipt and started its download.');
	}).catch(err => {
		console.log("err " + err);
		Document.progressStop();
		failure("" + err);
	});
}

function upgrade_verify(ots, hash, hashType, filename) {
	// OpenTimestamps command
	var op;
	if (hashType == "SHA1") {
		op = new OpenTimestamps.Ops.OpSHA1();
	} else if (hashType == "SHA256") {
		op = new OpenTimestamps.Ops.OpSHA256();
	} else if (hashType == "RIPEMD160") {
		op = new OpenTimestamps.Ops.OpRIPEMD160();
	} else {
		op = new OpenTimestamps.Ops.OpSHA256();
	}
	const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(ots);

	Proof.progressStart();

	const upgradeOptions = { whitelist: whitelistedCalendars }

	// OpenTimestamps upgrade command
	OpenTimestamps.upgrade(detachedOts, upgradeOptions).then((changed) => {
		const bytes = detachedOts.serializeToBytes();
		if (changed) {
			//success('Timestamp has been successfully upgraded!');
			download(filename, bytes);

			// update proof
			Proof.data = bin2String(bytes);
		} else {
			// File not changed: just upgraded
		}
		return OpenTimestamps.verifyTimestamp(detachedOts.timestamp, blockexplorers)
	}).then((results) => {
		Proof.progressStop();

		if (Object.keys(results).length == 0) {
			// no attestation returned
			if (detachedOts.timestamp.isTimestampComplete()) {
				Proof.progressStop();
				// check attestations
				detachedOts.timestamp.allAttestations().forEach(attestation => {
					if (attestation instanceof OpenTimestamps.Notary.UnknownAttestation) {
						proof_warning('Unknown attestation type');
					}
				});
			} else {
				proof_warning('The (.ots) submission receipt is still in pending attestation.');
			}
		} else {
			var text = "";
			Object.keys(results).map(chain => {
				var date = moment(results[chain].timestamp * 1000).tz(moment.tz.guess()).format('YYYY-MM-DD z')
				text += upperFirstLetter(chain) + ' block ' + results[chain].height + ' attests existence as of ' + date + '<br>';
			});
			verified(text);
		}
	}).catch(err => {
		Proof.progressStop();
		proof_failure(err.message);
	});
}

$(document).ready(function () {
	//	$('[data-toggle="tooltip"]').tooltip();
});
// Closes the sidebar menu
$('#menu-close').click(function (e) {
	e.preventDefault();
	$('#sidebar-wrapper').toggleClass('active');
});
// Opens the sidebar menu
$('#menu-toggle').click(function (e) {
	e.preventDefault();
	$('#sidebar-wrapper').toggleClass('active');
});
// Scrolls to the selected menu item on the page
$(function () {
	$('a[href*=\\#]:not([href=\\#],[data-toggle],[data-target],[data-slide])').click(function () {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 1000);
				return false;
			}
		}
	});
});
// #to-top button appears after scrolling
var fixed = false;
$(document).scroll(function () {
	if ($(this).scrollTop() > 250) {
		if (!fixed) {
			fixed = true;
			// $('#to-top').css({position:'fixed', display:'block'});
			$('#to-top').show('slow', function () {
				$('#to-top').css({
					position: 'fixed',
					display: 'block'
				});
			});
		}
	} else if (fixed) {
		fixed = false;
		$('#to-top').hide('slow', function () {
			$('#to-top').css({
				display: 'none'
			});
		});
	}
});


/* Hashes object to handle different hashes */

var Hashes = {
	init() {
		this.progress = true;
		this["SHA1"] = CryptoJS.algo.SHA1.create();
		this["SHA256"] = CryptoJS.algo.SHA256.create();
		this["RIPEMD160"] = CryptoJS.algo.RIPEMD160.create();
	},
	getSupportedTypes() {
		return ["SHA1", "SHA256", "RIPEMD160"];
	},
	update(type, msg) {
		this.progress = true;
		this[type].update(msg);
	},
	get(type) {
		this.progress = false;
		if (this[type] === undefined) {
			return undefined;
		}
		if (typeof (this[type]) == "string") {
			return this[type];
		}
		this[type] = this[type].finalize().toString();
		return this[type];
	},
	set(type, hash) {
		this.progress = false;
		this[type] = hash;
	}
}


/* Document object to upload & parse document file */
var Document = {
	init: function () {
		this.tagId = undefined;
		this.filename = undefined;
		this.filesize = undefined;
		Hashes.init();
	},
	setTagId: function (tagId) {
		this.tagId = tagId;
	},
	setFile: function (file, hashType) {
		this.filename = file.name;
		this.filesize = file.size;
	},
	exist: function () {
		return this.filename !== undefined && this.filesize !== undefined;
	},
	upload: function (file) {
		// callbackRead function
		var lastOffset = 0;
		var previous = [];
		function callbackRead(reader, file, evt, callbackProgress, callbackFinal) {
			if (lastOffset !== reader.offset) {
				// out of order
				//console.log("[",reader.size,"]",reader.offset,'->', reader.offset+reader.size,">>buffer");
				previous.push({ offset: reader.offset, size: reader.size, result: reader.result });
				return;
			}

			function parseResult(offset, size, result) {
				lastOffset = offset + size;
				callbackProgress(result);
				if (offset + size >= file.size) {
					lastOffset = 0;
					callbackFinal();
				}
			}

			// in order
			//console.log("[",reader.size,"]",reader.offset,'->', reader.offset+reader.size,"");
			parseResult(reader.offset, reader.size, reader.result);

			// resolve previous buffered
			var buffered = [{}]
			while (buffered.length > 0) {
				buffered = previous.filter(function (item) {
					return item.offset === lastOffset;
				});
				buffered.forEach(function (item) {
					//console.log("[", item.size, "]", item.offset, '->', item.offset + item.size, "<<buffer");
					parseResult(item.offset, item.size, item.result);
					previous.remove(item);
				})
			}
		}

		// loading function
		function loading(file, callbackProgress, callbackFinal) {
			var chunkSize = 1024 * 1024; // bytes
			var offset = 0;
			var size = chunkSize;
			var partial;
			var index = 0;

			if (file.size === 0) {
				callbackFinal();
			}
			while (offset < file.size) {
				partial = file.slice(offset, offset + size);
				var reader = new FileReader;
				reader.size = chunkSize;
				reader.offset = offset;
				reader.index = index;
				reader.onload = function (evt) {
					callbackRead(this, file, evt, callbackProgress, callbackFinal);
				};
				reader.readAsArrayBuffer(partial);
				offset += chunkSize;
				index += 1;
			}
		}


		// start upload
		var counter = 0;
		var self = this;

		Hashes.init();
		hashing('0%');

		loading(file,
			function (data) {
				var wordBuffer = CryptoJS.lib.WordArray.create(data);
				Hashes.update("SHA1", wordBuffer);
				Hashes.update("SHA256", wordBuffer);
				Hashes.update("RIPEMD160", wordBuffer);
				counter += data.byteLength;
				hashing(((counter / file.size) * 100).toFixed(0) + '%');

			}, function (data) {
				hashing('100%');
				console.log('SHA1 ' + Hashes.get("SHA1"));
				console.log('SHA256 ' + Hashes.get("SHA256"));
				console.log('RIPEMD160 ' + Hashes.get("RIPEMD160"));
				self.show();
				self.callback();
			});
	},
	show: function () {
		if (this.filename) {
			$(this.tagId + " .filename").html(this.filename);
			$(this.tagId + " .instructions").html("&nbsp;");
		} else {
			$(this.tagId + " .filename").html("Drop here the <b>original</b> file to check that its hash matches the receipt/proof one.");
		}
		if (this.filesize) {
			$(this.tagId + " .filesize").html(" " + humanFileSize(this.filesize, true));
		} else {
			$(this.tagId + " .filesize").html("&nbsp;");
		}

		var hashType = "SHA256";
		if (Proof.exist()) {
			hashType = Proof.getHashType().toUpperCase();
			if (!Hashes.getSupportedTypes().indexOf(hashType) === -1) {
				failure("Unsupported hash type");
				return;
			}
		}
		if (!Hashes.getSupportedTypes().indexOf(hashType) === -1) {
			failure("Unsupported hash type");
			return;
		}
		if (!Hashes.progress && Hashes.get(hashType)) {
			$(this.tagId + " .hash").html("(" + hashType + ") " + Hashes.get(hashType));
		} else {
			$(this.tagId + " .hash").html("&nbsp;");
		}
	},
	progressStart: function () {
		this.percent = 0;
		var self = this;
		this.interval = setInterval(() => {
			self.percent += parseInt(self.percent / 3) + 1;
			if (self.percent > 100) {
				self.percent = 100;
			}
			stamping(self.percent + ' %', 'Stamping')
		}, 100);
	},
	progressStop: function () {
		clearInterval(this.interval);
	},
	callback: function () {
		// Run automatically stamp or verify action
		if (Proof.exist()) {
			if (Proof.getHash() == Hashes.get("SHA256")) {
				if (Proof.verified()) {
					success('The provided file matches the provided (.ots) attestation proof: same hash values.')
				} else {
					matched('The provided file matches the provided (.ots) submission receipt: same hash values. Anyway, attestation is still pending.')
				}
			} else {
				failure('The provided file does NOT matches the provided receipt/proof: different hash values.')
			}
		} else {
			// Automatically stamp
			run_stamping();
		}
	}
};

/* Proof object to upload & parse OTS file */
var Proof = {
	init: function () {
		this.tagId = undefined;
		this.data = undefined;
		this.filename = undefined;
		this.filesize = undefined;
		this.isVerified = false;
	},
	isValid: function (fileName) {
		const res = fileName.match(/\.[0-9a-z]+$/i);
		return res !== null && res.length > 0 && res[0] === ".ots";
	},
	setTagId: function (tagId) {
		this.tagId = tagId;
	},
	setFile: function (file) {
		this.data = undefined;
		this.filename = file.name;
		this.filesize = file.size;
	},
	setArray: function (buffer) {
		this.data = buffer;
		this.filename = undefined;
		this.filesize = undefined;
	},
	exist: function () {
		return this.filename !== undefined && this.filesize !== undefined && this.data !== undefined;
	},
	verified: function () {
		return this.isVerified;
	},
	setVerified: function () {
		this.isVerified = true;
	},
	upload: function (file) {
		// Read and crypt the file
		var self = this;
		var reader = new FileReader();
		reader.onload = function (event) {
			var data = event.target.result;
			self.data = String(String(data));
			self.filename = file.name;
			self.filesize = file.size;
			self.show();
		};
		reader.readAsBinaryString(file);
	},
	show: function (tagId) {
		if (this.filename) {
			$(this.tagId + " .filename").html(this.filename);
			$(this.tagId + " .instructions").html("&nbsp;");
		} else {
			$(this.tagId + " .filename").html("----- never used ----");
		}
		if (this.filesize) {
			$(this.tagId + " .filesize").html(" " + humanFileSize(this.filesize, true));
		} else {
			$(this.tagId + " .filesize").html(" " + humanFileSize(this.data.length, true));
		}

		if (Proof.data) {
			var hashType = Proof.getHashType().toUpperCase();
			if (!Hashes.getSupportedTypes().indexOf(hashType) === -1) {
				proof_failure("Unsupported hash type");
				return;
			}
			var hash = Proof.getHash();
			$(this.tagId + " .hash").html("Stamped hash:<br>(" + hashType + ") " + hash);

			run_verification();
		}
	},
	getHashType: function () {
		const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(string2Bin(this.data));
		return detachedOts.fileHashOp._HASHLIB_NAME().toUpperCase();
	},
	getHash: function () {
		const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(string2Bin(this.data));
		return bytesToHex(detachedOts.fileDigest());
	},
	progressStart: function () {
		this.stopInterval = false;
		this.percent = 0;

		var self = this;
		this.interval = setInterval(() => {
			self.percent += parseInt(self.percent / 3) + 1;
			if (self.percent > 100) {
				self.percent = 100;
			}
			if (self.stopInterval == false) {
				verifying(self.percent + ' %', 'Verify')
			}
		}, 100);
	},
	progressStop: function () {
		this.stopInterval = true;
		clearInterval(this.interval);
	}
};

/* STARTUP FUNCTION */
(function () {
	// your page initialization code here
	// the DOM will be available here

	// Document/Proof upload on #dropbox1 box
	function dropbox1_upload(f) {
		if (f === undefined) {
			return;
		}
		if (Proof.isValid(f.name)) {
			Document.init();
			Document.setTagId('#dropbox2');
			Document.show();
			$('#dropbox2').show();
			$("#document-status").hide();

			Proof.init();
			Proof.setFile(f);
			Proof.setTagId('#dropbox1');
			Proof.show();
			Proof.upload(f);
			$("#proof-status").show();
		} else {
			Proof.init();
			$("#proof-status").hide();

			Document.init();
			Document.setFile(f);
			Document.setTagId('#dropbox1');
			Document.show();
			Document.upload(f);
			$('#dropbox2').hide();
			$("#document-status").show();
		}
	}
	$('#dropbox1').on('drop', function (event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).removeClass('hover');
		var f = event.originalEvent.dataTransfer.files[0];
		dropbox1_upload(f);
		return false;
	});
	$('#dropbox1').on('dragover', function (event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).addClass('hover');
		return false;
	});
	$('#dropbox1').on('dragleave', function (event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).removeClass('hover');
		return false;
	});
	$('#dropbox1').click(function (event) {
		event.preventDefault();
		event.stopPropagation();
		document.getElementById('dropbox1_input').click();
		return false;
	});
	$('#dropbox1_input').change(function (event) {
		var f = event.target.files[0];
		dropbox1_upload(f);
		return false;
	});

	// Document upload on #dropbox2 box
	function dropbox2_upload(f) {
		if (f === undefined) {
			return;
		}
		$('#document-status').show();
		Document.init()
		Document.setFile(f);
		Document.setTagId('#dropbox2');
		Document.show();
		Document.upload(f);
	}
	$('#dropbox2').on('drop', function (event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).removeClass('hover');
		var f = event.originalEvent.dataTransfer.files[0];
		dropbox2_upload(f);
		return false;
	});
	$('#dropbox2').on('dragover', function (event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).addClass('hover');
		return false;
	});
	$('#dropbox2').on('dragleave', function (event) {
		event.preventDefault();
		event.stopPropagation();
		$(this).removeClass('hover');
		return false;
	});
	$('#dropbox2').click(function (event) {
		event.preventDefault();
		event.stopPropagation();
		document.getElementById('dropbox2_input').click();
		return false;
	});
	$('#dropbox2_input').change(function (event) {
		event.preventDefault();
		var f = event.target.files[0];
		dropbox2_upload(f);
		return false;
	});

	// Get info action on ots

	$("#proof-status .statuses-info").click(function (event) {
		event.preventDefault();
		run_info();
		return false;
	});


	// Handle GET parameters
	const digest = getParameterByName('digest');
	const algorithm = getParameterByName('algorithm');
	if (digest) {
		Hashes.init();
		Hashes.set(digest, algorithm);
		Document.show();
	}
	const ots = getParameterByName('ots');
	if (ots) {
		Proof.setArray(hex2ascii(ots));
		Proof.show();
	}
	// autorun proof
	if (digest && ots) {
		run_verification();
	}


})();

/* Runnable functions on gui to start processes */
function run_stamping() {
	const algorithm = getParameterByName('algorithm');
	var hashType = "SHA256";
	if (algorithm) {
		hashType = algorithm.toUpperCase();
	}
	if (Hashes.get(hashType)) {
		stamp(Document.filename, Hashes.get(hashType), hashType);
	} else {
		failure("To <strong>stamp</strong> you need to drop a file in the Data field");
	}
}

function run_verification() {
	if (Proof.data) {
		Proof.progressStart();

		var hashType = Proof.getHashType().toUpperCase();
		if (!Hashes.getSupportedTypes().indexOf(hashType) === -1) {
			proof_failure("Not supported hash type");
			return;
		}
		if (!Hashes.get(hashType)) {
			proof_failure("No file to verify; upload one first");
			return;
		}
		Proof.upgraded = false;
		upgrade_verify(string2Bin(Proof.data), Hashes.get(hashType), hashType, Proof.filename);
	} else {
		proof_failure("To <strong>verify</strong> you need to drop a file in the Data field and a <strong>.ots</strong> receipt in the OpenTimestamps proof field")
	}
}

function run_info() {
	if (Proof.data) {
		location.href = "./info/?" + bytesToHex(string2Bin(Proof.data));
	} else {
		failure("To <strong>info</strong> you need to drop a file in the Data field and a <strong>.ots</strong> receipt in the OpenTimestamps proof field")
	}
}


/* EXTENDS ARRAY */
Array.prototype.remove = Array.prototype.remove || function (val) {
	var i = this.length;
	while (i--) {
		if (this[i] === val) {
			this.splice(i, 1);
		}
	}
}

/* COMMON FUNCTION */
function humanFileSize(bytes, si) {
	var thresh = si ? 1000 : 1024;
	if (Math.abs(bytes) < thresh) {
		return bytes + ' B';
	}
	var units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	var u = -1;
	do {
		bytes /= thresh;
		++u;
	} while (Math.abs(bytes) >= thresh && u < units.length - 1);
	return bytes.toFixed(1) + ' ' + units[u];
}
function download(filename, text) {
	var blob = new Blob([text], { type: "octet/stream" });
	saveAs(blob, filename + (Proof.isValid(filename) ? '' : '.ots'));
}
function string2Bin(str) {
	var result = [];
	for (var i = 0; i < str.length; i++) {
		result.push(str.charCodeAt(i));
	}
	return result;
}
function bin2String(array) {
	return String.fromCharCode.apply(String, array);
}
function ascii2hex(str) {
	var arr = [];
	for (var i = 0, l = str.length; i < l; i++) {
		var hex = Number(str.charCodeAt(i)).toString(16);
		if (hex < 0x10) {
			arr.push("0" + hex);
		} else {
			arr.push(hex);
		}
	}
	return arr.join('');
}
function hex2ascii(hexx) {
	var hex = hexx.toString();//force conversion
	var str = '';
	for (var i = 0; i < hex.length; i += 2)
		str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
	return str;
}
function bytesToHex(bytes) {
	const hex = [];
	for (var i = 0; i < bytes.length; i++) {
		hex.push((bytes[i] >>> 4).toString(16));
		hex.push((bytes[i] & 0xF).toString(16));
	}
	return hex.join('');
}
function hexToBytes(hex) {
	const bytes = [];
	for (var c = 0; c < hex.length; c += 2) {
		bytes.push(parseInt(hex.substr(c, 2), 16));
	}
	return bytes;
}
function upperFirstLetter(string) {
	return string[0].toUpperCase() + string.substr(1);
}
function getParameterByName(name, url) {
	if (!url) {
		url = window.location.href;
	}
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/* STATUS ALERT MESSAGES */
function proof_message(title, text, cssClass, showInfo) {
	$('#proof-status').attr('class', 'statuses ' + cssClass);
	$('#proof-status .statuses-title').html(title);
	$('#proof-status .statuses-description').html(text);
	if (showInfo != undefined && showInfo == true) {
		$('#proof-status .statuses-info').show();
	} else if (showInfo != undefined && showInfo == false) {
		$('#proof-status .statuses-info').hide();
	}
	$('#proof-status').show();
}
function verifying(text) {
	proof_message("VERIFYING", text, 'statuses_hashing', true);
}
function verified(text) {
	Proof.setVerified()
	proof_message("VERIFIED!", text, 'statuses_success');
}

function document_message(title, text, cssClass, showInfo) {
	$('#document-status').attr('class', 'statuses ' + cssClass);
	$('#document-status .statuses-title').html(title);
	$('#document-status .statuses-description').html(text);
	if (showInfo != undefined && showInfo == true) {
		$('#document-status .statuses-info').show();
	} else if (showInfo != undefined && showInfo == false) {
		$('#document-status .statuses-info').hide();
	}
	$('#document-status').show();
}
function hashing(text) {
	document_message("HASHING", text, 'statuses_hashing', false);
}
function stamping(text) {
	document_message("STAMPING", text, 'statuses_hashing', false);
}
function receipt(text) {
	document_message("SUBMITTED!", text, 'statuses_success');
}
function matched(text) {
	document_message("MATCHED!", text, 'statuses_success');
}
function success(text) {
	document_message("SUCCESS!", text, 'statuses_success');
}
function failure(text) {
	document_message("FAILURE!", text, 'statuses_failure');
}
function warning(text) {
	document_message("WARNING!", text, 'statuses_warning');
}
function proof_failure(text) {
	proof_message("FAILURE!", text, 'statuses_failure');
}
function proof_warning(text) {
	proof_message("WARNING!", text, 'statuses_warning');
}
