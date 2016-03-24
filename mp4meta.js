/* mp4meta.js -- extract mp4 metadata in your browser
 *
 * Copyright (C) 2016 Matthias Breithaupt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// Use http://atomicparsley.sourceforge.net/mpeg-4files.html for reference

function mp4meta(file, cb, timeout){
	var timeout = timeout&&!isNaN(timeout)?timeout:3000;
	var cbcalled = false;
	var timer = false;
	function cbhandler(meta){
		if(!cbcalled){
			cb(meta);
			cbcalled = true;
		}
		if(timer){
			clearTimeout(timer);
			timer=false;
		}
	}
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		read(file);
		timer = setTimeout(function(){cbhandler(meta)},timeout);
		var meta;
		function read(file){
			meta = {};
			if(file instanceof Blob){
				var reader = new FileReader();
				reader.readAsArrayBuffer(file);
				reader.onload = function(evt){
					var bytes = new Uint8Array(evt.target.result),
						pos = 0;
					while(pos<bytes.length && !cbcalled){
						var atom = getAtom(bytes.subarray(pos));
						if(atom.type==='moov'){
							readSubAtoms(atom, bytes, pos, atom.type);
						}
						pos+=Math.max(atom.size,8);
					}
					cbhandler(meta);
				}
			}else{
				cbhandler({});
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
			if(ret != null)
				meta[parent] = ret;
			return ret;
		}
		function readSubAtoms(atom, bytes, pos, parent){
			var pos2 = pos+8;
			var atom2;
			while(pos2<bytes.length&&pos2<pos+atom.size&&!cbcalled){
				atom2 = getAtom(bytes.subarray(pos2));
				if(atom2.type === 'udta'||atom2.type === 'meta'||atom2.type === 'ilst'||parent==='ilst'){
					readSubAtoms(atom2, bytes, pos2, atom2.type);
				}else if(atom2.type === 'data'){
					readDataAtom(atom2, bytes, pos2, parent);
				}
				pos2 += Math.max(atom2.size,4);
			}
		}
		function bytesToInt(arr){
			var ret=0;
			for(var i=0; i<arr.length && !cbcalled; i++){
				ret*=0x100;
				ret+=arr[i];
			}
			return ret;
		}
		function bytesToString(arr){
			var ret='';
			for(var i=0; i<arr.length && !cbcalled; i++){
				ret+=String.fromCharCode(arr[i]);
			}
			return ret;
		}
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
	} else {
		console.log('The File APIs are not fully supported in this browser.');
		cbhandler({});
	}
}
