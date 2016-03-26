# mediaid.js
Extract metadata from media files in your browser

## Usage
1. include `dist/mediaid.min.js` or `dist/mediaid.js`
2. call `mediaid` and pass it a blob, a file extension and a callback
3. profit

### Examples
```javascript
mediaid(myFile, '.mp4', function(metadata){console.log(metadata)});
```

### Timeout
There is also a third option that can be passed to `mediaid`. By default, timeout is set to 1000 milliseconds or 1 seconds. If you want to adjust this behavior (if your computer is slower or you don't want to wait that long - the value only applies to the worst case), you can, for example set it to 500 milliseconds as follows (assuming your callback is called `cb`):
```javascript
mediaid(myFile, '.avi', cb, 500);
```

## Attributes
By default, the attributes `title` and `artist` are considered most important. Therefore, these attributes will be named `title` and `artist` in the returned object if they are found.
If there are other objects found, they will usually also be added to the returned object with their original name as key. This name depends on the file format.

In case of any error, a string with a short error message will be added with the key `error`.

A file that can be parsed without problems but does not contain any supported metadata will cause an empty object to be returned.

## Supported formats
- RIFF
  - .avi, .wav
- QTFF
  - .mp4, .mov, .m4v, .m4a, .m4p, .m4b, .m4r
- ASF
  - .wmv, .wma, .asf
