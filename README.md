# mp4meta.js
Extract mp4 metadata in your browser

## Usage
1. include `mp4meta.js`
2. call `mp4meta` and pass it a blob and a callback
3. profit

### Examples
```javascript
mp4meta(myFile, function(metadata){console.log(metadata)});
```

### Timeout
There is also a third option that can be passed to `mp4meta`. By default, timeout is set to 3000 milliseconds or 3 seconds. If you want to adjust this behavior (if your computer is slower or you don't want to wait that long - the value only applies to the worst case), you can, for example set it to 500 milliseconds as follows (assuming your callback is called `cb`):
```javascript
mp4meta(myFile, cb, 500);
```

## links
http://atomicparsley.sourceforge.net/mpeg-4files.html - A great resource to find out about metadata tags.
