export default class crop {
    constructor(options = {}) {
        this.width = options.width || 400;
        this.height = options.height || 400;
        this.quality = options.quality || 0.8;
        this.success = options.success;
        this.style();
        const html = `
        <div class="crop-wall">
            <img class="crop-image">
        </div>
        <div class="crop-mask"></div>
        <input class="crop-zoom" type="range" value="100" min="100" max="200" step="1">
        <div class="crop-file">
            <input type="file" accept="image/*">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 1024 1024">
                <path fill="#fff"
                    d="M53.039687 176.551724 375.098244 176.551724C374.484286 176.551724 473.585858 291.710552 473.585858 291.710552 486.581177 307.112413 509.433838 317.793103 529.530968 317.793103L971.158687 317.793103C961.315964 317.793103 953.37931 309.775113 953.37931 300.309822L953.37931 882.58673C953.37931 872.955622 961.207896 865.103448 970.914322 865.103448L53.085678 865.103448C62.785907 865.103448 70.62069 872.915968 70.62069 882.765489L70.62069 158.889684C70.62069 168.590089 62.665481 176.551724 53.039687 176.551724ZM0 882.765489C0 911.963754 23.828092 935.724138 53.085678 935.724138L970.914322 935.724138C1000.258278 935.724138 1024 911.910877 1024 882.58673L1024 300.309822C1024 270.932674 1000.480803 247.172414 971.158687 247.172414L529.530968 247.172414C530.299604 247.172414 431.241728 132.013586 431.241728 132.013586 418.224358 116.585578 395.290394 105.931034 375.098244 105.931034L53.039687 105.931034C23.649986 105.931034 0 129.600124 0 158.889684L0 882.765489Z" />
            </svg>
        </div>
        <div class="crop-close"></div>
        <div class="crop-ok">OK</div>
        `;
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
        this.input.addEventListener("change", (e) => {
            this.files = e.target.files || e.dataTransfer.files;
            if (this.files.length == 0) return false;
            this.getOrientation(this.files[0], (o) => {
                this.orientation = o;
                var reader = new FileReader();
                reader.onload = (file) => {
                    this.open(this.dataURLtoBlob(file.target.result));
                };
                reader.readAsDataURL(this.files[0]);
            })
        });
        if (options.url != undefined) {
            this.open(options.url);
        }

        this.cropClose.addEventListener("click", () => {
            this.layout.parentNode.removeChild(this.layout);
        });

        // 渲染到canvas
        this.canvas = document.createElement("canvas")
        this.canvas.width = this.width
        this.canvas.height = this.height
        this.canvas.setAttribute("style", "position:absolute;left:0;top:0;opacity:0;pointer-events:none;")
        this.context = this.canvas.getContext("2d")

        this.layout.appendChild(this.canvas);

    }

    style() {
        if (document.querySelector("#cropStyle")) {
            return;
        }
        const css = `
            .crop {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate3d(-50%, -50%, 0);
                width: 400px;
                height: 400px;
                background: #000;
                box-shadow: 0 0 20px 2px rgba(0, 0, 0, .5);
                z-index: 20;
                transition: all .2s cubic-bezier(0.99, 0.01, 0.22, 0.94);
            }

            .crop.loading::after {
                content: "LOADING";
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                background-color: rgba(0, 0, 0, .5);
                color: #666;
            }

            .crop-wall {
                position: relative;
                height: 100%;
                overflow: hidden;
            }
            .crop-wall img{
                user-select:none;
            }
            .crop-mask{
                pointer-events:none;
                position:absolute;
                left:0;
                right:0;
                top:0;
                bottom:0;
            }
            .crop-mask::before{
                content:"";
                position:absolute;
                left:0;
                right:0;
                top:0;
                height:120px;
                background-image: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
            }
            .crop-mask::after{
                content:"";
                position:absolute;
                left:0;
                right:0;
                bottom:0;
                height:120px;
                background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%);
            }
            .crop-file {
                position: absolute;
                left: 15px;
                top: 15px;
                transition: .3s;
                cursor: pointer;
            }

            .crop-file:hover {
                transform: scale(1.2);
            }

            .crop-file svg {
                width: 22px;
                height: 22px;
            }

            .crop-file input {
                position: absolute;
                width: 100%;
                height: 100%;
                opacity: 0;
                cursor: pointer;
            }

            .crop.active .crop-file {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                transition: 0s;
            }

            .crop.loading .crop-file {
                opacity: 0;

            }

            .crop.active .crop-file svg {
                width: 50px;
                height: 50px;
            }

            .crop.active .crop-file svg path {
                fill: #333;
            }

            .crop-ok {
                position: absolute;
                right: 10px;
                bottom: 10px;
                width: 66px;
                height: 26px;
                border-radius: 40px;
                text-align: center;
                font-size: 10px;
                font-family: arial;
                line-height: 26px;
                border: 2px solid #fff;
                color: #fff;
                transition: all .2s ease-in-out;
                cursor: pointer;
                opacity: 0;
            }

            .crop-ok.show {
                opacity: 1;
            }

            .crop-ok:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }

            .crop-close {
                position: absolute;
                top: 15px;
                right: 15px;
                width: 30px;
                height: 30px;
                cursor: pointer;
                transition: .3s;
                transform: scale(0.8);
            }

            .crop-close:hover {
                transform: scale(1);
            }

            .crop-close:before {
                position: absolute;
                content: '';
                width: 30px;
                height: 2px;
                background: white;
                transform: rotate(45deg);
                top: 14px;
                left: 0px;
                border-radius: 2px;
            }

            .crop-close:after {
                content: '';
                position: absolute;
                width: 30px;
                height: 2px;
                background: white;
                transform: rotate(-45deg);
                top: 14px;
                left: 0px;
                border-radius: 2px;
            }

            .crop-zoom {
                position: absolute;
                left: 10px;
                bottom: 20px;
                width: 100px;
                opacity: 0;
                transition: .3s;
            }

            .crop-zoom.show {
                opacity: 1;
            }

            input[type=range] {
                -webkit-appearance: none;

            }

            input[type=range]:focus {
                outline: none;
            }

            input[type=range]::-webkit-slider-runnable-track {
                width: 100%;
                height: 2px;
                border-radius: 2px;
                background: #fff;
                border: none;

            }

            input[type=range]::-webkit-slider-thumb {
                height: 16px;
                width: 16px;
                border-radius: 10px;
                background: #fff;
                cursor: pointer;
                -webkit-appearance: none;
                margin-top: -8px;
                transition: .3s;
            }

            input[type=range]::-webkit-slider-thumb:hover {
                transform: scale(1.2);
            }

            input[type=range]::-moz-range-track {
                width: 100%;
                height: 2px;
                background: #000;
            }

            input[type=range]::-moz-range-thumb {
                height: 16px;
                width: 16px;
                border-radius: 8px;
                border: 2px solid #efb708;
                background: #ffffff;
                cursor: pointer;
            }

            input[type=range]::-ms-track {
                width: 100%;
                height: 1px;
                cursor: pointer;
                background: transparent;
                border-color: transparent;
                color: transparent;
            }

            input[type=range]::-ms-fill-lower {
                background: rgba(0, 0, 0, 0.5);
                border: 0px solid rgba(200, 200, 200, 0.2);
                border-radius: 0px;
                box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);
            }

            input[type=range]::-ms-fill-upper {
                background: rgba(0, 0, 0, 0.5);
                border: 0px solid rgba(200, 200, 200, 0.2);
                border-radius: 0px;
                box-shadow: 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px rgba(13, 13, 13, 0);
            }

            input[type=range]::-ms-thumb {
                height: 16px;
                width: 16px;
                border-radius: 8px;
                background: #ffffff;
                cursor: pointer;
                height: 1px;
            }

            input[type=range]:focus::-ms-fill-lower {
                background: rgba(0, 0, 0, 0.5);
            }

            input[type=range]:focus::-ms-fill-upper {
                background: rgba(0, 0, 0, 0.5);
            }
        `;
        const node = document.createElement("style");
        node.type = "text/css";
        node.id = "cropStyle"
        if (node.styleSheet) {
            node.styleSheet.cssText = css.replace(/\s/, "");
        } else {
            node.innerHTML = css.replace(/\s/, "");
        }
        document.getElementsByTagName("head")[0].appendChild(node);
    }
    // 打开裁剪
    open(url) {
        const that = this;
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
        this.img.onload = () => {
            this.crop.classList.remove("loading");
            this.crop.classList.remove("active");
            this.cropZoom.classList.add("show");
            this.cropOk.classList.add("show");
            // alert(this.img.naturalWidth + "/" + this.img.naturalHeight)
            // 按原始图片比例优先使用小值设置最低值
            this.temp = {
                width: this.img.naturalWidth,
                height: this.img.naturalHeight
            };
            if (this.orientation == 6) {
                this.temp.width = this.img.naturalHeight;
                this.temp.height = this.img.naturalWidth;
            }
            if (this.temp.width > this.temp.height) {
                this.scaleHeight = this.height;
                this.scaleWidth = Math.round(this.scaleHeight * this.temp.width / this.temp.height);
            } else {
                this.scaleWidth = this.width;
                this.scaleHeight = Math.round(this.scaleWidth * this.temp.height / this.temp.width);
            }

            // console.log(scaleX,scaleY,scaleWidth,scaleHeight);
            this.scaleX = -Math.round((this.scaleWidth - this.width) / 2);
            this.scaleY = -Math.round((this.scaleHeight - this.height) / 2);
            if (this.orientation == 6) {
                this.fixedOrientation(this.img, this.temp.width, this.temp.height, (src) => {
                    this.cropImage.setAttribute("src", src);
                })
            } else {

                this.cropImage.setAttribute("src", url);
            }

            this.crop.style.width = this.width + "px";
            this.crop.style.height = this.height + "px";
            this.cropWall.style.width = this.width + "px";
            this.cropWall.style.height = this.height + "px";

            this.cropImage.style.position = "absolute";
            this.cropImage.style.left = this.scaleX + "px";
            this.cropImage.style.top = this.scaleY + "px";
            this.cropImage.style.width = this.scaleWidth + "px";
            this.cropImage.style.height = this.scaleHeight + "px";
            this.cropImage.style.userSelect = "none";
            this.cropZoom.value = 100;

            this.cropCanvas();
            if (!this.hasEvent) {
                let okHander = () => {
                    let data = this.canvas.toDataURL("image/jpeg", this.quality);
                    this.success && this.success(data.substr(23));
                    this.layout.parentNode.removeChild(this.layout);
                }

                this.cropZoom.addEventListener("input", function (e) {
                    that.zoom(e);
                });
                this.cropOk.addEventListener("click", okHander);

                this.cropImage.addEventListener(that.isMobile ? "touchstart" : "mousedown", function (e) {
                    e.preventDefault();
                    that.isDrag = true
                    that.beginX = e.pageX - e.target.offsetLeft
                    that.beginY = e.pageY - e.target.offsetTop
                    // 拖动鼠标
                    const move = function (e) {
                        // console.log("move",e)
                        // e.preventDefault();

                        if (!that.isDrag) return false
                        // 放大
                        if (that.isMobile) {
                            if (e.touches.length == 2) {
                                that.scaleLength = that.touchData(e).length
                                that.scale = Math.min(200, Math.max(100, that.scaleLength / that.beginLength * 100))
                                this.zoom()
                            } else {
                                that.scaleX = e.pageX - beginX
                                that.scaleY = e.pageY - beginY

                            }
                        } else {
                            that.scaleX = e.pageX - that.beginX
                            that.scaleY = e.pageY - that.beginY
                        }
                        that.limit()
                        that.cropImage.style.width = that.scaleWidth + "px";
                        that.cropImage.style.height = that.scaleHeight + "px";
                        that.cropImage.style.left = that.scaleX + "px";
                        that.cropImage.style.top = that.scaleY + "px";
                    }

                    // 放开那个鼠标
                    const end = function (e) {
                        // e.preventDefault();
                        that.isDrag = false
                        if (that.isMobile) {
                            document.removeEventListener('touchmove', move, false)
                            document.removeEventListener('touchend', end, false)
                        } else {
                            document.removeEventListener('mousemove', move, false)
                            document.removeEventListener('mouseup', end, false)
                        }
                    }
                    if (that.isMobile) {
                        if (e.touches.length == 2) {
                            that.beginLength = that.beginLength == 0 ? that.touchData(e).length : that.beginLength
                        }
                        document.addEventListener('touchmove', move);
                        document.addEventListener('touchend', end);

                    } else {
                        document.addEventListener('mousemove', move);
                        document.addEventListener('mouseup', end);
                    }

                });
                this.hasEvent = true;
            }
        }
        this.img.src = url;
    }
    // 粘贴到canvas
    cropCanvas() {
        this.context.clearRect(0, 0, this.width, this.height)
        let sx = Math.round(Math.abs(this.scaleX) * this.img.naturalWidth / this.scaleWidth) //图像源x坐标
        let sy = Math.round(Math.abs(this.scaleY) * this.img.naturalHeight / this.scaleHeight) //图像源y坐标
        let sw = (this.width * this.img.naturalWidth / this.scaleWidth) >> 0
        let sh = (this.height * this.img.naturalHeight / this.scaleHeight) >> 0
        this.context.drawImage(this.img, sx, sy, sw, sh, 0, 0, this.width, this.height / this.cropRatio())
    }

    // http://stackoverflow.com/questions/11929099/html5-canvas-drawimage-ratio-bug-ios
    // 修正 iPhone 上传的方向问题
    cropRatio() {
        var iw = this.img.naturalWidth, ih = this.img.naturalHeight;
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
            py = (ey + sy) >> 1;
        }
        var ratio = (py / ih);
        return (ratio === 0) ? 1 : ratio;
    }

    getOrientation(file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {

            var view = new DataView(e.target.result);
            if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
            var length = view.byteLength, offset = 2;
            while (offset < length) {
                var marker = view.getUint16(offset, false);
                offset += 2;
                if (marker == 0xFFE1) {
                    if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
                    var little = view.getUint16(offset += 6, false) == 0x4949;
                    offset += view.getUint32(offset + 4, little);
                    var tags = view.getUint16(offset, little);
                    offset += 2;
                    for (var i = 0; i < tags; i++)
                        if (view.getUint16(offset + (i * 12), little) == 0x0112)
                            return callback(view.getUint16(offset + (i * 12) + 8, little));
                }
                else if ((marker & 0xFF00) != 0xFF00) break;
                else offset += view.getUint16(offset, false);
            }
            return callback(-1);
        };
        reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
    }

    //图片压缩
    fixedOrientation(img, width, height, callback) {
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
            let url = URL.createObjectURL(blob);
            callback && callback(url);
        });

    }
    // 放大缩小
    zoom(e) {
        let s = parseInt(e.target.value) / 100;
        let osx = this.scaleX - this.width / 2;
        let osy = this.scaleY - this.height / 2;
        let os;
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
        this.scaleX = (osx) * s / os + this.width / 2;
        this.scaleY = (osy) * s / os + this.height / 2;
        this.limit();
        this.cropCanvas()
        this.cropImage.style.width = this.scaleWidth + "px";
        this.cropImage.style.height = this.scaleHeight + "px";
        this.cropImage.style.left = this.scaleX + "px";
        this.cropImage.style.top = this.scaleY + "px";
    }
    // 限制拖动检测边缘
    limit() {
        if (this.scaleX < -(this.scaleWidth - this.width)) this.scaleX = -(this.scaleWidth - this.width)
        if (this.scaleY < -(this.scaleHeight - this.height)) this.scaleY = -(this.scaleHeight - this.height)
        if (this.scaleX > 0) this.scaleX = 0
        if (this.scaleY > 0) this.scaleY = 0
        if (this.scaleHeight === this.height) this.scaleY = 0
        if (this.scaleWidth === this.width) this.scaleX = 0
    }

    // 获取多点触控
    touchData(e) {
        if (e.touches.length < 2) return
        let x1 = e.touches[0].pageX
        let x2 = e.touches[1].pageX
        let x3 = (x1 <= x2 ? (x2 - x1) / 2 + x1 : (x1 - x2) / 2 + x2)
        let y1 = e.touches[0].pageY - this.scrollbar.scrollTop
        let y2 = e.touches[1].pageY - this.scrollbar.scrollTop
        let y3 = (y1 <= y2 ? (y2 - y1) / 2 + y1 : (y1 - y2) / 2 + y2)
        return {
            length: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
            x: Math.round(x3),
            y: Math.round(y3)
        }
    }

    dataURLtoBlob(dataurl) {
        let arr = dataurl.split(',');
        let mime = arr[0].match(/:(.*?);/)[1];
        let bstr = atob(arr[1]);
        let n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return URL.createObjectURL(new Blob([u8arr], { type: mime }));
    }

}