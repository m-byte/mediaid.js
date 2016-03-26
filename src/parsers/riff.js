/* riff.js
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
