/* tools.js
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
