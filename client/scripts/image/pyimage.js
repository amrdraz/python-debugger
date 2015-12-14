(function() {
    var _ = window._;
    var scale = 50;
    var noneImage = {
            index: 0,
            draw: function () {                
            },
            getState: function () {
                return {index:0}
            },
            setState: function () {
            }
        };
    var game = {
        mainCanvas: $('#turtlecanvas'),
        ctx: $('#turtlecanvas')[0].getContext('2d'),
        imageCanvas: $('#imagecanvas'),
        tmpctx: $('#imagecanvas')[0].getContext('2d'),
        images: {},
        objects: [noneImage],
        subject: noneImage,
        draw: function draw() {
            if (Game.can_draw()) {
                clearContext(game.ctx)
                game.subject.draw();
            }
        },
        addObject: function addObject (obj) {
            if (obj.index!==undefined) {
                game.objects[obj.index] = obj;
            } else {
                obj.index = game.objects.length;
                game.objects.push(obj);
            }
        },
        red: '#ff0000',
        green: '#00ff00',
        blue: '#0000ff',
        black: '#000000',
        white: '#ffffff',
    };

    window.Game = (function Game() {
        var canDraw = true;

        return {
            reset_level: function resetLevel() {
                game.subject = noneImage;
            },
            game: game,
            can_draw: function(can_draw) {
                if (can_draw !== undefined) {
                    canDraw = can_draw;
                }
                return canDraw;
            },
            init: function initGame(state) {
                state;
            },
            get_state: function getState() {
                return game.subject.getState();
            },
            set_state: function setState(state) {
                game.subject = game.objects[state.index];
                game.subject.setState(state)
            }
        };
    })();

    var Pixel = function(r, g , b, a) {
        var pixel;
        if (typeof(r) === 'object') {
            var data = r;
            var index = g;
            pixel = {
                r: data[index*4 + 0],
                g: data[index*4 + 1],
                b: data[index*4 + 2],
                a: data[index*4 + 3]
            }
            pixel.data = data;
            pixel.index = index;
        } else if (typeof(r) === 'string') {
            pixel = hexToRgb(r);
        } else if (r > 255) {
            pixel = numToRgb(r);
        } else {
            pixel = {
                r: r,
                g: g,
                b: b,
                a: a
            }
        }
        pixel.a = pixel.a || 255;
        _.assign(pixel, {
            setData: function (data, i) {
                pixel.data = data;
                pixel.index = i;
                pixel.r = data[index*4 + 0];
                pixel.g = data[index*4 + 1];
                pixel.b = data[index*4 + 2];
                pixel.a = data[index*4 + 3];
            },
            setRed: function setRed (r) {
                pixel.r = r;
                if (pixel.data) { pixel.data[pixel.index*4 + 0] = r; }
            },
            getRed: function getRed () {
                return pixel.r
            },
            setGreen: function setGreen (g) {
                pixel.g = g;
                if (pixel.data) { pixel.data[pixel.index*4 + 1] = g; }
            },
            getGreen: function getGreen () {
                return pixel.g
            },
            setBlue: function setBlue (b) {
                pixel.b = b;
                if (pixel.data) { pixel.data[pixel.index*4 + 2] = b; }
            },
            getBlue: function getBlue () {
                return pixel.b
            },
            setAlpha: function setBlue (a) {
                pixel.a = a;
                if (pixel.data) { pixel.data[pixel.index*4 + 3] = a; }
            },
            getBlue: function getBlue () {
                return pixel.b
            },
            setRGB: function setRGB (rgb) {
                var r = pixel.r = rgb >> 16;
                var g = pixel.g = (rgb - r << 16) >> 8;
                var b = pixel.b = rgb - (r << 16) - (g << 8);
                if (pixel.data) {
                    pixel.data[pixel.index*4 + 0] = r;
                    pixel.data[pixel.index*4 + 1] = g;
                    pixel.data[pixel.index*4 + 2] = b;
                }
            },
            getAverage: function getAverage () {
                return Math.floor((pixel.r + pixel.b + pixel.g) / 3)
            },
            getBit: function getBit (threshold) {
                threshold = threshold || 128
                return (threshold <= pixel.getAverage())?1:0;
            },
            setBit: function setBit (n) {
                pixel.data[pixel.index*4 + 0] = pixel.r = 255 * (n) // R
                pixel.data[pixel.index*4 + 1] = pixel.b = 255 * (n) // G
                pixel.data[pixel.index*4 + 2] = pixel.g = 255 * (n) // B
                pixel.data[pixel.index*4 + 3] = pixel.a = 255 // A
            },
            __str__: function toString() {
                return pixel.hex();  
            },
            hex: function () {
                return "0x" + ((1 << 24) + (pixel.r << 16) + (pixel.g << 8) + pixel.b).toString(16).slice(1);
            },
            bin: function () {
                return ((1 << 24) + (pixel.r << 16) + (pixel.g << 8) + pixel.b).toString(2);
            }
        });

        return pixel;

        function numToRgb(rgb) {
            var obj = {}
            var r = obj.r = rgb >> 16;
            var g = obj.g = (rgb - r << 16) >> 8;
            obj.b = rgb - (r << 16) - (g << 8);
            return obj;
        }

        function hexToRgb(hex) {
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            var obj = {};

            if (result) {
                obj.r = parseInt(result[1], 16);
                obj.g = parseInt(result[2], 16);
                obj.b = parseInt(result[3], 16);
            };
            return obj;
        }
    }

    var ImageWrapper = function (imageData) {
        var image = {};
        image.imageData = imageData;
        image.width = imageData.width;
        image.height = imageData.height;
        image.zoom = image.zoom || 1;
        game.addObject(image);
        image.getPixel = function getPixel(x, y) {
            return image.pixels[x * image.width + y]
        }
        image.setPixels = function setPixels (imageData) {
            var pixels = image.pixels;
            if (!pixels) {
                pixels = image.pixels = []
                for (var i = 0; i < imageData.data.length;i+=4){
                    pixel = Pixel(imageData.data, i/4);
                    pixels.push(pixel);
                }
            } else {
                for (var i = 0; i < image.pixels.length;i+=1){
                    var pixel = image.pixels[i].js?image.pixels[i].js:image.pixels[i];
                        pixel.setData(imageData.data, i);
                }
            }
        }
        image.setZoom = function setZoom (zoom) {
            image.zoom = zoom;
        }
        image.getState = function getState() {
            game.tmpctx.putImageData(image.imageData, 0, 0);
            var data = game.tmpctx.getImageData(0, 0, image.imageData.width, image.imageData.height);
            return {
                index: image.index,
                zoom: image.zoom,
                imageData: data
            }
        }
        image.setState = function setState(state) {
            image.imageData = state.imageData
            image.setPixels(state.imageData);
            image.zoom = state.zoom;
        }
        image.draw = function draw () {
            game.tmpctx.putImageData(image.imageData, 0, 0);
            game.ctx.drawImage(game.imageCanvas[0], 0, 0, image.width, image.height, 0, 0, image.width * image.zoom, image.height * image.zoom);
        }
        image.__str__ = function __str__() {
            game.render(image);
            return "[class Image]";
        }

        image.setPixels(image.imageData);
        return image;
    }

    var BitImage = function (width, height, bits) {
        if (bits.length > width*height) {
            throw new Error("BitImage must have bits equal to the width*hight");
        }
        var image = game.tmpctx.createImageData(width, height);
        
        for (var i = 0; i<bits.length;i+=1){
            image.data[i*4 + 0] = 255 * (+bits.charAt(i)) // R
            image.data[i*4 + 1] = 255 * (+bits.charAt(i)) // G
            image.data[i*4 + 2] = 255 * (+bits.charAt(i)) // B
            image.data[i*4 + 3] = 255 // A
        }

        image = ImageWrapper(image);

        return image;
    }
    var SimpleImage = function (imgKey) {
        if (!game.images[imgKey]) {
            throw new Error("Image Source Not Found");
        }
        var img = game.images[imgKey];
        game.imageCanvas.attr('width', img.width);
        game.imageCanvas.attr('height', img.height);
        game.tmpctx.drawImage(img, 0, 0);
        var image = game.tmpctx.getImageData(0, 0, img.width, img.height);
        image = ImageWrapper(image);

        return image;
    }

    loadImages({
        'x.png': 'images/pixel/x.png',
        '51020-poppy.png': 'images/pixel/51020-poppy.png',
        '51020-stop-sign.png': 'images/pixel/51020-stop-sign.png',
        'puzzle-copper.png': 'images/pixel/puzzle-copper.png',
        'flowers.png': 'images/pixel/flowers.png',
        'stop.jpg': 'images/pixel/stop.jpg'
    }, function(images) {
        game.initialState = Game.get_state();
        game.BitImage = BitImage;
        game.SimpleImage = SimpleImage;
        game.render = function (image) {
            game.subject = image;
            game.draw();
        }

        game.ctx.imageSmoothingEnabled = false;
        game.ctx.mozImageSmoothingEnabled = false;
        game.ctx.webkitImageSmoothingEnabled = false;
        game.ctx.msImageSmoothingEnabled = false;

        game.draw();
    })

    function clearContext(context) {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }

    function loadImages(paths, cb) {
        var images = {}

        function resolve(img, imgKey) {
            return function() {
                images[imgKey] = img;
                checkResolution();
            }
        }

        function checkResolution() {
            if (Object.keys(paths).length === Object.keys(images).length) {
                _.assign(game.images, images);
                cb(images);
            }
        }
        Object.keys(paths).forEach(function(imgKey) {
            var img = new Image();
            img.onload = resolve(img, imgKey);
            img.src = paths[imgKey];
        });
    }
})()
