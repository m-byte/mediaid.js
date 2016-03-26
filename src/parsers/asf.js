/* asf.js
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
