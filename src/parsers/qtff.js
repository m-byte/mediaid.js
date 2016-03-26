/* qtff.js
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
