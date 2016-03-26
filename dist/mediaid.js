/*! mediaid - v1.0.0 - 26.03.2016
 * Copyright 2016-2016 Matthias Breithaupt
 * Licensed under the MIT license.
 */
(function(window){
var mediaid = {version:'1.0.0',parser:{}};
(function(mediaid){
	var hexEncodeArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
		tool = {};
	tool.arrToHex = function(arr){
		var s = '';
		for (var i = 0; i < arr.length; i++) {
			var code = arr[i];
			s += hexEncodeArray[code >>> 4];
			s += hexEncodeArray[code & 0x0F];
		}
		return s;
	};
	tool.bytesToInt = function(arr,le){
		var ret=0;
		if(le){
			for(var i=arr.length-1; i>=0; i--){
				ret*=0x100;
				ret+=arr[i];
			}
		}else{
			for(var i=0; i<arr.length; i++){
				ret*=0x100;
				ret+=arr[i];
			}
		}
		return ret;
	};
	tool.bytesToString = function(arr,wchar){
		var ret='';
		if(wchar){
			for(var i=0; i+1<arr.length; i+=2){
				ret+=String.fromCharCode(arr[i] + arr[i+1] * 0x100);
			}
		}else{
			for(var i=0; i<arr.length; i++){
				ret+=String.fromCharCode(arr[i]);
			}
		}
		return ret;
	};
	mediaid.tool = tool;
}(mediaid));

(function(mediaid){
	mediaid.parser.asf = function(bytes, maxpos, meta, abort){
		var bytesToInt = mediaid.tool.bytesToInt,
			bytesToString = mediaid.tool.bytesToString,
			arrToHex = mediaid.tool.arrToHex;
		function getObject(bytes){
			if(bytes.length > 23){
				var guid = arrToHex(bytes.subarray(0, 16));
					size = bytesToInt(bytes.subarray(16, 24),true);
				return {size:size, guid:guid};
			}else{
				console.log('unexpected EOF');
				return {size:bytes.length+1, guid:null};
			}
		}
		function getMetaData(bytes){
			var pos = 0,
				tlength = bytesToInt(bytes.subarray(pos, pos+=2),true),
				alength = bytesToInt(bytes.subarray(pos, pos+=2),true),
				clength = bytesToInt(bytes.subarray(pos, pos+=2),true),
				dlength = bytesToInt(bytes.subarray(pos, pos+=2),true);
			pos += 2; // skip length of rating
			if(tlength > 0) meta.title = bytesToString(bytes.subarray(pos,pos+=tlength),true);
			if(alength > 0) meta.artist = bytesToString(bytes.subarray(pos,pos+=alength),true);
			if(dlength > 0) meta.description = bytesToString(bytes.subarray(pos+=clength,pos+=dlength),true);
			return;
		}
		function parseASF(bytes, maxpos){
			var pos = 0;
			while(pos<maxpos && !abort.value){
				var object = getObject(bytes.subarray(pos));
				if(object.guid==='3026b2758e66cf11a6d900aa0062ce6c'){
					object.count = bytesToInt(bytes.subarray(24, 28),true);
					parseASF(bytes.subarray(pos + 30), object.size);
					return;
				}else if(object.guid==='3326b2758e66cf11a6d900aa0062ce6c'){
					getMetaData(bytes.subarray(pos + 24));
					return;
				}
				pos+=Math.max(object.size,24);
			}
		}
		parseASF(bytes,maxpos);
	};
}(mediaid));

(function(mediaid){
	mediaid.parser.qtff = function(bytes, maxpos, meta, abort){
		var bytesToInt = mediaid.tool.bytesToInt,
			bytesToString = mediaid.tool.bytesToString;
		function getAtom(bytes){
			if(bytes.length > 7){
				var size = bytesToInt(bytes.subarray(0, 4)),
					type = bytesToString(bytes.subarray(4, 8));
				return {size:size, type:type};
			}else{
				console.log('unexpected EOF');
				return {size:bytes.length+1, type:''};
			}
		}
		function readDataAtom(atom, bytes, pos, parent){
			var ret = null,
				flags = bytesToInt(bytes.subarray(pos+8, pos+12));
			if(atom.size <= 16)
				return null;
			switch(flags){
				case 0:
				case 21:
					ret = atom.size !== 24 ? null : bytesToInt(bytes.subarray(pos+16, pos+24));
					break;
				case 1:
					ret = bytesToString(bytes.subarray(pos+16, pos+atom.size));
					break;
				default:
					return null;
			}
			switch(parent){
				case decodeURI("%C2%A9nam"):
					parent = 'title';
					break;
				case decodeURI("%C2%A9ART"):
					parent = 'artist'
					break;
			}
			if(ret != null)
				meta[parent] = ret;
			return ret;
		}
		function parseQTFF(atom, bytes, pos, parent){
			var pos2 = pos+8;
			var atom2;
			while(pos2<bytes.length&&pos2<pos+atom.size&&!abort.value){
				atom2 = getAtom(bytes.subarray(pos2));
				if(atom2.type==='moov' || atom2.type === 'udta'||atom2.type === 'meta'||atom2.type === 'ilst'||parent==='ilst'){
					parseQTFF(atom2, bytes, pos2, atom2.type);
				}else if(atom2.type === 'data'){
					readDataAtom(atom2, bytes, pos2, parent);
				}
				pos2 += Math.max(atom2.size,4);
			}
		}
		parseQTFF({size:bytes.length,type:'root'},bytes,-8,'');
	};
}(mediaid));

(function(mediaid){
	mediaid.parser.riff = function(bytes, maxpos, meta, abort){
		var bytesToInt = mediaid.tool.bytesToInt,
			bytesToString = mediaid.tool.bytesToString;
		function getChunk(bytes){
			if(bytes.length > 7){
				var tag = bytesToString(bytes.subarray(0,4)),
					size = bytesToInt(bytes.subarray(4, 8),true)+8;
				size = Math.ceil(size/4)*4; // fix for some avi files
				return {size:size, type:tag};
			}else{
				meta.error = 'Unexpected EOF';
				return {size:bytes.length+1, type:null};
			}
		}
		function parseRIFF(bytes, maxpos,child){
			var pos = 0;
			var hdr = bytesToString(bytes.subarray(pos,pos+=4));
			if(!child){
				var size = bytesToInt(bytes.subarray(pos,pos+=4),true)+pos;
				pos+=4;
				if(hdr !== 'RIFF' || size > bytes.length){
					meta.error = 'Invalid file';
					return;
				}
			}else{
				if(hdr !== 'INFO'){
					return;
				}
			}
			while(pos<maxpos && !abort.value){
				var chunk = getChunk(bytes.subarray(pos));
				if(chunk.type==='LIST'){
					if(parseRIFF(bytes.subarray(pos+8),chunk.size-8,true)){
						return;
					}
				}else if(hdr === 'INFO'){
					var val = bytesToString(bytes.subarray(pos+8,Math.min(pos+chunk.size,maxpos)));
					switch(chunk.type){
						case 'IART':
							meta.artist = val;
							break;
						case 'INAM':
							meta.title = val;
							break;
						default:
							meta[chunk.type] = val;
					}
				}
				pos+=Math.max(chunk.size,8);
			}
			return hdr === 'INFO';
		}
		parseRIFF(bytes,maxpos);
	};
}(mediaid));

(function(mediaid){
	mediaid.fileid = function(extension){
		switch(extension){
			case '.mp4':
			case '.mov':
			case '.m4v':
			case '.m4a':
			case '.m4p':
			case '.m4b':
			case '.m4r':
				return 'qtff';
			case '.avi':
			case '.wav':
				return 'riff';
			case '.wmv':
			case '.wma':
			case '.asf':
				return 'asf';
			default:
				return null;
		}
	};
}(mediaid));

function main(){
	if(arguments.length < 3)
		return mediaid;
	var file = arguments[0],
		ext = arguments[1],
		timeout = arguments.length > 3 ? arguments[2] : 1000,
		cb = arguments[arguments.length-1],
		type = null, meta = {}, timer = false, cbcalled = {value:false};
	if(typeof cb !== 'function' || isNaN(timeout) || typeof ext !== 'string')
		throw new TypeError('Bad arguments');
	if(!(window.File && window.FileReader && window.FileList && window.Blob)){
		console.warn('The File APIs are not fully supported in this browser.');
		return cb({error:'No file API support'});
	}
	if(!file instanceof Blob)
		return cb({error:'Cannot open file'});
	type = mediaid.fileid(ext);
	if(!type)
		return cb({error:'Unknown file extension'});
	if(!mediaid.parser.hasOwnProperty(type))
		return cb({error:'No parser for type \'' + type + '\''});
	
	function cbhandler(){
		if(!cbcalled.value){
			cb(meta);
			cbcalled.value = true;
		}
		if(timer){
			clearTimeout(timer);
			timer=false;
		}
	}
	timer = setTimeout(function(){
		meta.error='Timeout';
		cbhandler();
	},timeout);
	var reader = new FileReader();
	reader.readAsArrayBuffer(file);
	reader.onload = function(evt){
		var bytes = new Uint8Array(evt.target.result);
		mediaid.parser[type](bytes, bytes.length, meta, cbcalled);
		cbhandler(meta);
	}
}
window.mediaid = main;
}(window));
//# sourceMappingURL=mediaid.js.map