/* index.js
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
