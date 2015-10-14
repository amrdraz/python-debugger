(function() {
    var _ = window._;
    var scale = 50;
    var game = {
        ctx: $('#turtlecanvas')[0].getContext('2d'),
        images: {},
        draw: function draw() {
            if (Game.can_draw()) {
                clearContext(game.ctx)
                game.world.draw();
                game.od.draw();
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
                delete game.world;
                delete game.od;
                game.world = World();
                game.od = Od(game.images['od']);
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
                return {
                    world: game.world.getState(),
                    od: game.od.getState(),
                }
            },
            set_state: function setState(state) {
                game.world.setState(state.world);
                game.od.setState(state.od);
            }
        };
    })();

    var Color = function(hex) {
        this.hex = hex;

        var rgb = hexToRgb(hex)
        rgb.hex = hex;

        return rgb;

        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        function hexToRgb(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
    }

    var Block = function(x, y) {
        x = x || 0;
        y = y || 0;
        return {
            x: x,
            y: y,
            z: 0,
            color: Color("#eee"),
            draw: function drawBlock() {
                game.ctx.save();
                game.ctx.fillStyle = this.color.hex;
                game.ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
                game.ctx.restore();
            },
            setColor: function(hex) {
                delete this.color;
                this.color = Color(hex);
            },
            toString: function toString() {
                return this.color.hex;
            },
            getState: function getState() {
                return {
                    color: this.color.hex,
                    x: this.x,
                    y: this.y,
                    z: this.z
                }
            },
            setState: function setState(state) {
                this.x = state.x;
                this.y = state.y;
                this.color = Color(state.color);
            }
        }
    }

    var World = function() {
        var grid = _.range(0, 10).fill(_.range(0, 10));
        grid = grid.map(function(row, x) {
            return row.map(function(objKey, y) {
                return Block(x, y);
            })
        })

        return {
            grid: grid,
            draw: function worldDraw() {
                this.grid.forEach(function(row, x) {
                    row.forEach(function(objKey, y) {
                        grid[x][y].draw();
                    })
                })
            },
            color: function colorBlock(x, y, hex) {
                this.grid[x][y].setColor(hex);
            },
            get_color: function getColorBlock(x, y) {
                return this.grid[x][y].color.hex;
            },
            toString: function toString() {
                return this.grid.map(function(row, x) {
                    var str = row.map(function(block, y) {
                        return block.toString();
                    });
                    return str.join(",");
                });
            },
            getState: function getState() {
                return {
                    grid: this.grid.map(function(row, x) {
                        return row.map(function(block, y) {
                            return block.getState();
                        });
                    })
                };
            },
            setState: function setState(state) {
                this.grid.map(function(row, x) {
                    return row.map(function(block, y) {
                        return block.setState(state.grid[x][y]);
                    });
                });
            }
        }
    }

    var Od = function Od(img, x, y) {
        img = img;
        var x = x || 0;
        var y = y || 0;
        return {
            x: x,
            y: y,
            img: img,
            draw: function drawOd() {
                game.ctx.drawImage(img, this.x * scale, this.y * scale, scale, scale);
            },
            move: function moveTo(x, y) {
                this.x = x;
                this.y = y || this.y;
            },
            move_right: function moveRight() {
                this.x = Math.min(game.world.grid.length - 1, this.x + 1);
            },
            move_left: function moveLeft() {
                this.x = Math.max(0, this.x - 1);
            },
            move_up: function moveUp() {
                this.y = Math.max(0, this.y - 1);
            },
            move_down: function moveDown() {
                this.y = Math.min(game.world.grid.length - 1, this.y + 1);
            },
            set_color: function color(hex) {
                game.world.color(this.x, this.y, hex)
            },
            get_color: function color() {
                return game.world.get_color(this.x, this.y)
            },
            getState: function getState() {
                return {
                    id: 'od',
                    x: this.x,
                    y: this.y,
                    img: 'od',
                    imgSrc: this.img.src
                }
            },
            setState: function(state) {
                var od = this;
                this.x = state.x;
                this.y = state.y;
                if (game.images[state.img]) {
                    this.img = game.images[state.img];
                } else {
                    var img = {}
                    img[state.img] = state.imgSrc;
                    loadImages(img, function(images) {
                        od.img = images[state.img];
                    })
                }
            }
        }
    }

    loadImages({
        od: 'images/Od_block.png'
    }, function(images) {
        game.world = World();
        game.od = Od(images.od);
        game.initialState = Game.get_state();

        game.move_right = function moveRight() {
            game.od.move_right();
            game.draw();
        }
        game.move_left = function moveRight() {
            game.od.move_left();
            game.draw();
        }
        game.move_up = function moveRight() {
            game.od.move_up();
            game.draw();
        }
        game.move_down = function moveRight() {
            game.od.move_down();
            game.draw();
        }
        game.set_color = function setColor(color) {
            game.od.set_color(color)
            game.draw();
        }
        game.get_color = function getColor() {
            return game.od.get_color();
        }

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
