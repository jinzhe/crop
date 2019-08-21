(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.crop = factory());
}(this, (function () { 'use strict';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var crop = function () {
    function crop() {
        var _this = this;

        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        classCallCheck(this, crop);

        this.width = options.width || 400;
        this.height = options.height || 400;
        this.quality = options.quality || 0.8;
        this.success = options.success;
        this.style();
        var html = "\n        <div class=\"crop-wall\">\n            <img class=\"crop-image\">\n        </div>\n        <div class=\"crop-mask\"></div>\n        <input class=\"crop-zoom\" type=\"range\" value=\"100\" min=\"100\" max=\"200\" step=\"1\">\n        <div class=\"crop-file\">\n            <input type=\"file\" accept=\"image/*\">\n            <svg xmlns=\"http://www.w3.org/2000/svg\" class=\"icon\" viewBox=\"0 0 1024 1024\">\n                <path fill=\"#fff\"\n                    d=\"M53.039687 176.551724 375.098244 176.551724C374.484286 176.551724 473.585858 291.710552 473.585858 291.710552 486.581177 307.112413 509.433838 317.793103 529.530968 317.793103L971.158687 317.793103C961.315964 317.793103 953.37931 309.775113 953.37931 300.309822L953.37931 882.58673C953.37931 872.955622 961.207896 865.103448 970.914322 865.103448L53.085678 865.103448C62.785907 865.103448 70.62069 872.915968 70.62069 882.765489L70.62069 158.889684C70.62069 168.590089 62.665481 176.551724 53.039687 176.551724ZM0 882.765489C0 911.963754 23.828092 935.724138 53.085678 935.724138L970.914322 935.724138C1000.258278 935.724138 1024 911.910877 1024 882.58673L1024 300.309822C1024 270.932674 1000.480803 247.172414 971.158687 247.172414L529.530968 247.172414C530.299604 247.172414 431.241728 132.013586 431.241728 132.013586 418.224358 116.585578 395.290394 105.931034 375.098244 105.931034L53.039687 105.931034C23.649986 105.931034 0 129.600124 0 158.889684L0 882.765489Z\" />\n            </svg>\n        </div>\n        <div class=\"crop-close\"></div>\n        <div class=\"crop-ok\">OK</div>\n        ";
        this.layout = document.createElement('DIV');
        this.layout.classList.add("crop");
        this.layout.classList.add("active");
        this.layout.innerHTML = html;
        document.querySelector("body").appendChild(this.layout);

        this.input = document.querySelector(options.input || ".crop-file");
        this.crop = document.querySelector(options.crop || ".crop");
        this.cropWall = document.querySelector(options.wall || ".crop-wall");
        this.cropImage = document.querySelector(options.image || ".crop-image");
        this.cropClose = document.querySelector(options.close || ".crop-close");
        this.cropOk = document.querySelector(options.ok || ".crop-ok");
        this.cropZoom = document.querySelector(options.zoom || ".crop-zoom");
        this.crop.style.width = this.width + "px";
        this.crop.style.height = this.height + "px";
        this.cropWall.style.width = this.width + "px";
        this.cropWall.style.height = this.height + "px";
        this.input.addEventListener("change", function (e) {
            _this.files = e.target.files || e.dataTransfer.files;
            if (_this.files.length == 0) return false;
            _this.getOrientation(_this.files[0], function (o) {
                _this.orientation = o;
                var reader = new FileReader();
                reader.onload = function (file) {
                    _this.open(_this.dataURLtoBlob(file.target.result));
                };
                reader.readAsDataURL(_this.files[0]);
            });
        });
        if (options.url != undefined) {
            this.open(options.url);
        }

        this.cropClose.addEventListener("click", function () {
            _this.layout.parentNode.removeChild(_this.layout);
        });

        // 渲染到canvas
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.setAttribute("style", "position:absolute;left:0;top:0;opacity:0;pointer-events:none;");
        this.context = this.canvas.getContext("2d");

        this.layout.appendChild(this.canvas);
    }

    createClass(crop, [{
        key: "style",
        value: function style() {
            if (document.querySelector("#cropStyle")) {
                return;
            }
            var css = "\n            .crop {\n                position: absolute;\n                left: 50%;\n                top: 50%;\n                transform: translate3d(-50%, -50%, 0);\n                width: 400px;\n                height: 400px;\n                background: #000;\n                box-shadow: 0 0 20px 2px rgba(0, 0, 0, .5);\n                z-index: 20;\n                transition: all .2s cubic-bezier(0.99, 0.01, 0.22, 0.94);\n            }\n\n            .crop.loading::after {\n                content: \"LOADING\";\n                position: absolute;\n                left: 0;\n                right: 0;\n                top: 0;\n                bottom: 0;\n                display: flex;\n                align-items: center;\n                justify-content: center;\n                font-size: 10px;\n                background-color: rgba(0, 0, 0, .5);\n                color: #666;\n            }\n\n            .crop-wall {\n                position: relative;\n                height: 100%;\n                overflow: hidden;\n            }\n            .crop-wall img{\n                user-select:none;\n            }\n            .crop-mask{\n                pointer-events:none;\n                position:absolute;\n                left:0;\n                right:0;\n                top:0;\n                bottom:0;\n            }\n            .crop-mask::before{\n                content:\"\";\n                position:absolute;\n                left:0;\n                right:0;\n                top:0;\n                height:120px;\n                background-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);\n            }\n            .crop-mask::after{\n                content:\"\";\n                position:absolute;\n                left:0;\n                right:0;\n                bottom:0;\n                height:120px;\n                background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);\n            }\n            .crop-file {\n                position: absolute;\n                left: 15px;\n                top: 15px;\n                transition: .3s;\n                cursor: pointer;\n            }\n\n            .crop-file:hover {\n                transform: scale(1.2);\n            }\n\n            .crop-file svg {\n                width: 22px;\n                height: 22px;\n            }\n\n            .crop-file input {\n                position: absolute;\n                width: 100%;\n                height: 100%;\n                opacity: 0;\n                cursor: pointer;\n            }\n\n            .crop.active .crop-file {\n                position: absolute;\n                left: 50%;\n                top: 50%;\n                transform: translate(-50%, -50%);\n                transition: 0s;\n            }\n\n            .crop.loading .crop-file {\n                opacity: 0;\n\n            }\n\n            .crop.active .crop-file svg {\n                width: 50px;\n                height: 50px;\n            }\n\n            .crop.active .crop-file svg path {\n                fill: #333;\n            }\n\n            .crop-ok {\n                position: absolute;\n                right: 10px;\n                bottom: 10px;\n                width: 66px;\n                height: 26px;\n                border-radius: 40px;\n                text-align: center;\n                font-size: 10px;\n                font-family: arial;\n                line-height: 26px;\n                border: 2px solid #fff;\n                color: #fff;\n                transition: all .2s ease-in-out;\n                cursor: pointer;\n                opacity: 0;\n            }\n\n            .crop-ok.show {\n                opacity: 1;\n            }\n\n            .crop-ok:hover {\n                background-color: rgba(255, 255, 255, 0.2);\n            }\n\n            .crop-close {\n                position: absolute;\n                top: 15px;\n                right: 15px;\n                width: 30px;\n                height: 30px;\n                cursor: pointer;\n                transition: .3s;\n                transform: scale(0.8);\n            }\n\n            .crop-close:hover {\n                transform: scale(1);\n            }\n\n            .crop-close:before {\n                position: absolute;\n                content: '';\n                width: 30px;\n                height: 2px;\n                background: white;\n                transform: rotate(45deg);\n                top: 14px;\n                left: 0px;\n                border-radius: 2px;\n            }\n\n            .crop-close:after {\n                content: '';\n                position: absolute;\n                width: 30px;\n                height: 2px;\n                background: white;\n                transform: rotate(-45deg);\n                top: 14px;\n                left: 0px;\n                border-radius: 2px;\n            }\n\n            .crop-zoom {\n                position: absolute;\n                left: 10px;\n                bottom: 20px;\n                width: 100px;\n                opacity: 0;\n                transition: .3s;\n            }\n\n            .crop-zoom.show {\n                opacity: 1;\n            }\n\n            input[type=range] {\n                -webkit-appearance: none;\n\n            }\n\n            input[type=range]:focus {\n                outline: none;\n            }\n\n            input[type=range]::-webkit-slider-runnable-track {\n                width: 100%;\n                height: 2px;\n                border-radius: 2px;\n                background: #fff;\n                border: none;\n\n            }\n\n            input[type=range]::-webkit-slider-thumb {\n                height: 16px;\n                width: 16px;\n                border-radius: 10px;\n                background: #fff;\n                cursor: pointer;\n                -webkit-appearance: none;\n                margin-top: -8px;\n                transition: .3s;\n            }\n\n            input[type=range]::-webkit-slider-thumb:hover {\n                transform: scale(1.2);\n            }\n\n            input[type=range]::-moz-range-track {\n                width: 100%;\n                height: 2px;\n                background: #000;\n            }\n\n            input[type=range]::-moz-range-thumb {\n                height: 16px;\n                width: 16px;\n                border-radius: 8px;\n                border: 2px solid #efb708;\n                background: #ffffff;\n                cursor: pointer;\n            }\n\n            input[type=range]::-ms-track {\n                width: 100%;\n                height: 1px;\n                cursor: pointer;\n                background: transparent;\n                border-color: transparent;\n                color: transparent;\n            }\n\n            input[type=range]::-ms-fill-lower {\n                background: rgba(0, 0, 0, 0.5);\n                border: 0px solid rgba(200, 200, 200, 0.2);\n                border-radius: 0px;\n                box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);\n            }\n\n            input[type=range]::-ms-fill-upper {\n                background: rgba(0, 0, 0, 0.5);\n                border: 0px solid rgba(200, 200, 200, 0.2);\n                border-radius: 0px;\n                box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);\n            }\n\n            input[type=range]::-ms-thumb {\n                height: 16px;\n                width: 16px;\n                border-radius: 8px;\n                background: #ffffff;\n                cursor: pointer;\n                height: 1px;\n            }\n\n            input[type=range]:focus::-ms-fill-lower {\n                background: rgba(0, 0, 0, 0.5);\n            }\n\n            input[type=range]:focus::-ms-fill-upper {\n                background: rgba(0, 0, 0, 0.5);\n            }\n        ";
            var node = document.createElement("style");
            node.type = "text/css";
            node.id = "cropStyle";
            if (node.styleSheet) {
                node.styleSheet.cssText = css.replace(/\s/, "");
            } else {
                node.innerHTML = css.replace(/\s/, "");
            }
            document.getElementsByTagName("head")[0].appendChild(node);
        }
        // 打开裁剪

    }, {
        key: "open",
        value: function open(url) {
            var _this2 = this;

            var that = this;
            this.isMobile = /ios|android/.test(navigator.userAgent.toLowerCase());
            this.beginX = 0;
            this.beginY = 0;
            this.scaleX = 0;
            this.scaleY = 0;
            this.scaleHeight = 0;
            this.scaleWidth = 0;
            this.isDrag = false;

            this.crop.classList.add("loading");

            this.img = new Image();
            this.img.crossOrigin = 'anonymous';
            this.img.onload = function () {
                _this2.crop.classList.remove("loading");
                _this2.crop.classList.remove("active");
                _this2.cropZoom.classList.add("show");
                _this2.cropOk.classList.add("show");
                // alert(this.img.naturalWidth + "/" + this.img.naturalHeight)
                // 按原始图片比例优先使用小值设置最低值
                _this2.temp = {
                    width: _this2.img.naturalWidth,
                    height: _this2.img.naturalHeight
                };
                if (_this2.orientation == 6) {
                    _this2.temp.width = _this2.img.naturalHeight;
                    _this2.temp.height = _this2.img.naturalWidth;
                }
                if (_this2.temp.width > _this2.temp.height) {
                    _this2.scaleHeight = _this2.height;
                    _this2.scaleWidth = Math.round(_this2.scaleHeight * _this2.temp.width / _this2.temp.height);
                } else {
                    _this2.scaleWidth = _this2.width;
                    _this2.scaleHeight = Math.round(_this2.scaleWidth * _this2.temp.height / _this2.temp.width);
                }

                // console.log(scaleX,scaleY,scaleWidth,scaleHeight);
                _this2.scaleX = -Math.round((_this2.scaleWidth - _this2.width) / 2);
                _this2.scaleY = -Math.round((_this2.scaleHeight - _this2.height) / 2);
                if (_this2.orientation == 6) {
                    _this2.fixedOrientation(_this2.img, _this2.temp.width, _this2.temp.height, function (src) {
                        _this2.cropImage.setAttribute("src", src);
                    });
                } else {

                    _this2.cropImage.setAttribute("src", url);
                }

                _this2.crop.style.width = _this2.width + "px";
                _this2.crop.style.height = _this2.height + "px";
                _this2.cropWall.style.width = _this2.width + "px";
                _this2.cropWall.style.height = _this2.height + "px";

                _this2.cropImage.style.position = "absolute";
                _this2.cropImage.style.left = _this2.scaleX + "px";
                _this2.cropImage.style.top = _this2.scaleY + "px";
                _this2.cropImage.style.width = _this2.scaleWidth + "px";
                _this2.cropImage.style.height = _this2.scaleHeight + "px";
                _this2.cropImage.style.userSelect = "none";
                _this2.cropZoom.value = 100;

                _this2.cropCanvas();
                if (!_this2.hasEvent) {
                    var okHander = function okHander() {
                        var data = _this2.canvas.toDataURL("image/jpeg", _this2.quality);
                        _this2.success && _this2.success(data.substr(23));
                        _this2.layout.parentNode.removeChild(_this2.layout);
                    };

                    _this2.cropZoom.addEventListener("input", function (e) {
                        that.zoom(e);
                    });
                    _this2.cropOk.addEventListener("click", okHander);

                    _this2.cropImage.addEventListener(that.isMobile ? "touchstart" : "mousedown", function (e) {
                        e.preventDefault();
                        that.isDrag = true;
                        that.beginX = e.pageX - e.target.offsetLeft;
                        that.beginY = e.pageY - e.target.offsetTop;
                        // 拖动鼠标
                        var move = function move(e) {
                            // console.log("move",e)
                            // e.preventDefault();

                            if (!that.isDrag) return false;
                            // 放大
                            if (that.isMobile) {
                                if (e.touches.length == 2) {
                                    that.scaleLength = that.touchData(e).length;
                                    that.scale = Math.min(200, Math.max(100, that.scaleLength / that.beginLength * 100));
                                    this.zoom();
                                } else {
                                    that.scaleX = e.pageX - beginX;
                                    that.scaleY = e.pageY - beginY;
                                }
                            } else {
                                that.scaleX = e.pageX - that.beginX;
                                that.scaleY = e.pageY - that.beginY;
                            }
                            that.limit();
                            that.cropImage.style.width = that.scaleWidth + "px";
                            that.cropImage.style.height = that.scaleHeight + "px";
                            that.cropImage.style.left = that.scaleX + "px";
                            that.cropImage.style.top = that.scaleY + "px";
                        };

                        // 放开那个鼠标
                        var end = function end(e) {
                            // e.preventDefault();
                            that.isDrag = false;
                            if (that.isMobile) {
                                document.removeEventListener('touchmove', move, false);
                                document.removeEventListener('touchend', end, false);
                            } else {
                                document.removeEventListener('mousemove', move, false);
                                document.removeEventListener('mouseup', end, false);
                            }
                        };
                        if (that.isMobile) {
                            if (e.touches.length == 2) {
                                that.beginLength = that.beginLength == 0 ? that.touchData(e).length : that.beginLength;
                            }
                            document.addEventListener('touchmove', move);
                            document.addEventListener('touchend', end);
                        } else {
                            document.addEventListener('mousemove', move);
                            document.addEventListener('mouseup', end);
                        }
                    });
                    _this2.hasEvent = true;
                }
            };
            this.img.src = url;
        }
        // 粘贴到canvas

    }, {
        key: "cropCanvas",
        value: function cropCanvas() {
            this.context.clearRect(0, 0, this.width, this.height);
            var sx = Math.round(Math.abs(this.scaleX) * this.img.naturalWidth / this.scaleWidth); //图像源x坐标
            var sy = Math.round(Math.abs(this.scaleY) * this.img.naturalHeight / this.scaleHeight); //图像源y坐标
            var sw = this.width * this.img.naturalWidth / this.scaleWidth >> 0;
            var sh = this.height * this.img.naturalHeight / this.scaleHeight >> 0;
            this.context.drawImage(this.img, sx, sy, sw, sh, 0, 0, this.width, this.height / this.cropRatio());
        }

        // http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
        // 修正 iPhone 上传的方向问题

    }, {
        key: "cropRatio",
        value: function cropRatio() {
            var iw = this.img.naturalWidth,
                ih = this.img.naturalHeight;
            var canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = ih;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(this.img, 0, 0);
            var data = ctx.getImageData(0, 0, 1, ih).data;
            // search image edge pixel position in case it is squashed vertically.
            var sy = 0;
            var ey = ih;
            var py = ih;
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3];
                if (alpha === 0) {
                    ey = py;
                } else {
                    sy = py;
                }
                py = ey + sy >> 1;
            }
            var ratio = py / ih;
            return ratio === 0 ? 1 : ratio;
        }
    }, {
        key: "getOrientation",
        value: function getOrientation(file, callback) {
            var reader = new FileReader();
            reader.onload = function (e) {

                var view = new DataView(e.target.result);
                if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
                var length = view.byteLength,
                    offset = 2;
                while (offset < length) {
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if (marker == 0xFFE1) {
                        if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                        var little = view.getUint16(offset += 6, false) == 0x4949;
                        offset += view.getUint32(offset + 4, little);
                        var tags = view.getUint16(offset, little);
                        offset += 2;
                        for (var i = 0; i < tags; i++) {
                            if (view.getUint16(offset + i * 12, little) == 0x0112) return callback(view.getUint16(offset + i * 12 + 8, little));
                        }
                    } else if ((marker & 0xFF00) != 0xFF00) break;else offset += view.getUint16(offset, false);
                }
                return callback(-1);
            };
            reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
        }

        //图片压缩

    }, {
        key: "fixedOrientation",
        value: function fixedOrientation(img, width, height, callback) {
            var canvas, ctx;
            canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext("2d");
            //如果图片方向等于6 ，则旋转矫正，反之则不做处理
            if (this.orientation == 6) {
                ctx.save();
                ctx.translate(width / 2, height / 2);
                ctx.rotate(90 * Math.PI / 180);
                ctx.drawImage(img, 0 - height / 2, 0 - width / 2, height, width);
                ctx.restore();
            } else {
                ctx.drawImage(img, 0, 0, width, height);
            }
            canvas.toBlob(function (blob) {
                var url = URL.createObjectURL(blob);
                callback && callback(url);
            });
        }
        // 放大缩小

    }, {
        key: "zoom",
        value: function zoom(e) {
            var s = parseInt(e.target.value) / 100;
            var osx = this.scaleX - this.width / 2;
            var osy = this.scaleY - this.height / 2;
            var os = void 0;
            // 按原始图片比例优先使用小值设置最低值
            if (this.temp.width > this.temp.height) {
                os = this.scaleHeight / this.height;
                this.scaleHeight = this.height * s;
                this.scaleWidth = this.scaleHeight * this.temp.width / this.temp.height;
            } else {
                os = this.scaleWidth / this.width;
                this.scaleWidth = this.width * s;
                this.scaleHeight = this.scaleWidth * this.temp.height / this.temp.width;
            }
            this.scaleX = osx * s / os + this.width / 2;
            this.scaleY = osy * s / os + this.height / 2;
            this.limit();
            this.cropCanvas();
            this.cropImage.style.width = this.scaleWidth + "px";
            this.cropImage.style.height = this.scaleHeight + "px";
            this.cropImage.style.left = this.scaleX + "px";
            this.cropImage.style.top = this.scaleY + "px";
        }
        // 限制拖动检测边缘

    }, {
        key: "limit",
        value: function limit() {
            if (this.scaleX < -(this.scaleWidth - this.width)) this.scaleX = -(this.scaleWidth - this.width);
            if (this.scaleY < -(this.scaleHeight - this.height)) this.scaleY = -(this.scaleHeight - this.height);
            if (this.scaleX > 0) this.scaleX = 0;
            if (this.scaleY > 0) this.scaleY = 0;
            if (this.scaleHeight === this.height) this.scaleY = 0;
            if (this.scaleWidth === this.width) this.scaleX = 0;
        }

        // 获取多点触控

    }, {
        key: "touchData",
        value: function touchData(e) {
            if (e.touches.length < 2) return;
            var x1 = e.touches[0].pageX;
            var x2 = e.touches[1].pageX;
            var x3 = x1 <= x2 ? (x2 - x1) / 2 + x1 : (x1 - x2) / 2 + x2;
            var y1 = e.touches[0].pageY - this.scrollbar.scrollTop;
            var y2 = e.touches[1].pageY - this.scrollbar.scrollTop;
            var y3 = y1 <= y2 ? (y2 - y1) / 2 + y1 : (y1 - y2) / 2 + y2;
            return {
                length: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
                x: Math.round(x3),
                y: Math.round(y3)
            };
        }
    }, {
        key: "dataURLtoBlob",
        value: function dataURLtoBlob(dataurl) {
            var arr = dataurl.split(',');
            var mime = arr[0].match(/:(.*?);/)[1];
            var bstr = atob(arr[1]);
            var n = bstr.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return URL.createObjectURL(new Blob([u8arr], { type: mime }));
        }
    }]);
    return crop;
}();

return crop;

})));
