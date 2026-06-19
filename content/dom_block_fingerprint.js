'use strict';
// 拦截浏览器硬件指纹

// 保存原始方法的引用，用于后期可能的恢复
const originals = {
    deviceMemory: Object.getOwnPropertyDescriptor(Navigator.prototype, 'deviceMemory')?.get,
    hardwareConcurrency: Object.getOwnPropertyDescriptor(Navigator.prototype, 'hardwareConcurrency')?.get,
    getImageData: window.CanvasRenderingContext2D?.prototype.getImageData,
    matchMedia: window.matchMedia,
    getBoundingClientRect: Element.prototype.getBoundingClientRect,
    offsetWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')?.get,
    offsetHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')?.get,
    fontCheck: window.FontFaceSet?.prototype.check,
    RTCPeerConnection: Object.getOwnPropertyDescriptor(window, 'RTCPeerConnection'),
    webkitRTCPeerConnection: Object.getOwnPropertyDescriptor(window, 'webkitRTCPeerConnection'),
};

// 恢复原厂设置的函数
function restore_originals() {
    if (originals.deviceMemory) {
        Object.defineProperty(Navigator.prototype, 'deviceMemory', { get: originals.deviceMemory, configurable: true });
    }
    if (originals.hardwareConcurrency) {
        Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', { get: originals.hardwareConcurrency, configurable: true });
    }
    if (originals.getImageData && window.CanvasRenderingContext2D) {
        CanvasRenderingContext2D.prototype.getImageData = originals.getImageData;
    }
    if (originals.matchMedia) {
        window.matchMedia = originals.matchMedia;
    }
    if (originals.getBoundingClientRect) {
        Element.prototype.getBoundingClientRect = originals.getBoundingClientRect;
    }
    if (originals.offsetWidth && originals.offsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { get: originals.offsetWidth, configurable: true });
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { get: originals.offsetHeight, configurable: true });
    }
    if (originals.fontCheck && window.FontFaceSet) {
        FontFaceSet.prototype.check = originals.fontCheck;
    }
    if (originals.RTCPeerConnection) {
        Object.defineProperty(window, 'RTCPeerConnection', originals.RTCPeerConnection);
    }
    if (originals.webkitRTCPeerConnection) {
        Object.defineProperty(window, 'webkitRTCPeerConnection', originals.webkitRTCPeerConnection);
    }

}

// 一个简单的内置伪随机生成器 (SFC32)
function createRandomGenerator(seedString) {
    let h = 1779033703 ^ seedString.length;
    for (let i = 0; i < seedString.length; i++) {
        h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    let a = (h ^ (h >>> 16)) >>> 0;
    return function() {
        a >>>= 0;
        let t = (a + 0x7ED55D16) | 0;
        a = t ^ (t << 13);
        return ((a ^ (a >>> 15)) >>> 0) / 4294967296;
    };
}

// 硬件特性反指纹（基本）
function block_device_pr_base(){
    let hour = (new Date()).getHours(); hour = hour===0?24:hour;

    // 1. deviceMemory - 直接删除
    if ('deviceMemory' in navigator) {
        Object.defineProperty(navigator, 'deviceMemory', {
            get: () => false,  // 返回 undefined 。4、6、8、12、16、24、32、64、128
            configurable: true // 【优化】改为 true 允许后续通过 restore_originals 还原
        });
    }

    // 1.5 hardwareConcurrency - 覆盖vCPU核心数
    if ('hardwareConcurrency' in navigator) {
        Object.defineProperty(navigator, 'hardwareConcurrency', {
            get: () => hour*2, // 4、8、16、32
            configurable: true // 【优化】改为 true 允许还原
        });
    }

    // 2. oscpu - 直接删除
    if ('oscpu' in navigator) {
        Object.defineProperty(navigator, 'oscpu', {
            get: () => false,
            configurable: true
        });
    }

    // 4. language 和 languages - 保留前两位
    const originalLanguages = navigator.languages;
    if (originalLanguages && originalLanguages.length > 0) {
        const trimmedLanguages = originalLanguages.slice(0, 2);

        Object.defineProperty(navigator, 'languages', {
            get: () => trimmedLanguages,
            configurable: true // 【优化】改为 true 允许还原
        });

        Object.defineProperty(navigator, 'language', {
            get: () => trimmedLanguages[0],
            configurable: true // 【优化】改为 true 允许还原
        });
    }

}

// 硬件特性反指纹（高级）
function block_device_pr_upper() {
    let hour = (new Date()).getHours(); hour = hour===0?24:hour;

    // 3. webdriver - 设置为 false
    if ('webdriver' in navigator) {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
            configurable: true // 【优化】改为 true 允许还原
        });
    }

    // 5. mimeTypes：标准化为只包含 PDF（带迭代器）
    if (navigator.mimeTypes) {
        const standardMimeTypes = {
            0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: null
            },
            1: {
                type: 'text/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: null
            },
            length: 2,
            item: function(index) {
                return this[index] || null;
            },
            namedItem: function(name) {
                if (name === 'application/pdf' || name === 'text/pdf') {
                    return this[0];
                }
                return null;
            },
            // 添加迭代器，使其支持 [...mimeTypes]
            [Symbol.iterator]: function*() {
                for (let i = 0; i < this.length; i++) {
                    yield this[i];
                }
            }
        };

        Object.defineProperty(navigator, 'mimeTypes', {
            get: () => standardMimeTypes,
            configurable: true // 【优化】改为 true 允许还原
        });
    }

    // 6. plugins：标准化为只包含 PDF 插件（带迭代器）
    if (navigator.plugins) {
        // 创建 PDF 插件的 MimeType 对象
        const pdfMimeTypes = {
            0: {
                type: 'application/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: null
            },
            1: {
                type: 'text/pdf',
                suffixes: 'pdf',
                description: 'Portable Document Format',
                enabledPlugin: null
            },
            length: 2,
            item: function(index) {
                return this[index] || null;
            },
            namedItem: function(name) {
                if (name === 'application/pdf' || name === 'text/pdf') {
                    return this[0];
                }
                return null;
            },
            // 添加迭代器
            [Symbol.iterator]: function*() {
                for (let i = 0; i < this.length; i++) {
                    yield this[i];
                }
            }
        };

        // 创建 PDF 插件对象
        const pdfPlugin = {
            name: 'Chrome PDF Plugin',
            filename: 'internal-pdf-viewer',
            description: 'Portable Document Format',
            length: 2,
            0: pdfMimeTypes[0],
            1: pdfMimeTypes[1],
            item: function(index) {
                return this[index] || null;
            },
            namedItem: function(name) {
                // 支持通过 MIME 类型查询
                if (name === 'application/pdf' || name === 'text/pdf') {
                    return this[0];
                }
                return null;
            },
            // 添加迭代器
            [Symbol.iterator]: function*() {
                for (let i = 0; i < this.length; i++) {
                    yield this[i];
                }
            }
        };

        // 标准化的 PluginArray
        const standardPlugins = {
            0: pdfPlugin,
            length: 1,
            item: function(index) {
                return this[index] || null;
            },
            namedItem: function(name) {
                // 支持通过插件名查询
                if (name === 'Chrome PDF Plugin' || name === 'PDF Viewer') {
                    return this[0];
                }
                // 支持通过 MIME 类型查询（重要！）
                if (name === 'application/pdf' || name === 'text/pdf') {
                    return this[0];
                }
                return null;
            },
            refresh: function() {},
            // 添加迭代器（关键修复）
            [Symbol.iterator]: function*() {
                for (let i = 0; i < this.length; i++) {
                    yield this[i];
                }
            }
        };

        Object.defineProperty(navigator, 'plugins', {
            get: () => standardPlugins,
            configurable: true // 【优化】改为 true 允许还原
        });
    }

    // 7. connection：智能 Wi-Fi（修正网速值）
    if ('connection' in navigator) {
        // 【优化】静态化返回对象，避免每次调用 getter 都执行动态计算，提高微观性能
        const cachedConnection = {
            effectiveType: '4g',
            rtt: 30,
            downlink: 100,
            saveData: false,
            type: 'wifi',
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
        };
        const cachedFastConnection = {
            effectiveType: '4g',
            rtt: 10,
            downlink: 300,
            saveData: false,
            type: 'wifi',
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true
        };

        Object.defineProperty(navigator, 'connection', {
            get: () => {
                const hour = new Date().getHours();
                const isSlowTime = (hour >= 10 && hour <= 15) || (hour >= 17 && hour <= 22);
                return isSlowTime ? cachedConnection : cachedFastConnection;
            },
            configurable: true // 【优化】改为 true 允许还原
        });
    }

    // 8. performance.memory 浏览器自动分配给网页的堆栈大小，1GB-4GB
    if (window.performance && performance.memory) {
        // 【工业级优化】静态化一个基准值，利用随机上下摆动模拟真实网页的内存动态变化，防止死板数据被指纹算法识别
        const limit16GB = 2 * 1024 * 1024 * 1024; // 2GB 的精准字节数 (4 * 1024 * 1024 * 1024)

        Object.defineProperty(performance, 'memory', {
            get: () => {
                // 生成一个在 80MB 到 120MB 之间动态波动的总分配内存
                const baseTotal = 100000000 + (Math.random() - 0.5) * 20000000;
                // 已用内存永远小于总分配内存，占比在 45% ~ 65% 之间随机波动
                const baseUsed = baseTotal * (0.45 + Math.random() * 0.2);

                return {
                    jsHeapSizeLimit: limit16GB,  // 完美伪造 16GB 限制额度
                    totalJSHeapSize: Math.floor(baseTotal),
                    usedJSHeapSize: Math.floor(baseUsed)
                };
            },
            configurable: true // 【优化】改为 true 允许还原
        });
    }

}

// 带缓存的阶梯形的随机canvas噪点反指纹
function block_canvas_pr(stringSeed = "default_seed") {
    if (!window.CanvasRenderingContext2D || !originals.getImageData) return;

    const resultCache = new WeakMap();

    CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        const canvasEl = this.canvas;
        if (canvasEl && resultCache.has(canvasEl)) {
            const cached = resultCache.get(canvasEl);
            if (cached.args && cached.args.every((v, i) => v === args[i])) {
                return cached.result;
            }
        }

        const imageData = originals.getImageData.apply(this, args);
        if (!imageData || !imageData.data) return imageData;

        const data = imageData.data;
        const len = data.length;
        const pixelCount = len / 4;

        if (pixelCount > 250000) return imageData;

        // 【关键修复】使用基于账户种子的伪随机函数，保证本账户刷新后噪点一致，跨账户噪点不同
        const myRandom = createRandomGenerator(stringSeed + pixelCount);

        let modifyRate = pixelCount <= 4096 ? 0.1 : 0.05;
        const pixelStep = pixelCount > 4096 ? 4 : 2;

        for (let i = 0; i < len; i += 4 * pixelStep) {
            if (myRandom() < modifyRate) {
                // 基于种子生成的相对固定的微小扰动（-1 ~ +1 像素）
                const offset = (myRandom() - 0.5) * 2;
                data[i]     = Math.min(255, Math.max(0, data[i] + offset));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + offset));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + offset));
            }
        }

        if (canvasEl) {
            resultCache.set(canvasEl, { args: [...args], result: imageData });
        }

        return imageData;
    };
}

// 反CSS指纹（轻微）
function block_css_pr() {
    // 1. 覆盖媒体查询
    if (!originals.matchMedia) return;

    // 保存绑定后的原始方法
    const originalMatchMedia = originals.matchMedia.bind(window);

    window.matchMedia = function(query) {
        if (query.includes('prefers-')) {
            if (query.includes('prefers-contrast')) {
                return originalMatchMedia('(prefers-contrast: no-preference)');
            }
            if (query.includes('prefers-reduced-motion')) {
                return originalMatchMedia('(prefers-reduced-motion: no-preference)');
            }
        }
        return originalMatchMedia(query);
    };

    // 2. 字体检测防御
    if (!originals.getBoundingClientRect) return;

    // 【性能优化】预编译正则表达式，扩大防御范围，捕获更多指纹库常用的特征字符
    const fontRegex = /font|test|fingerprint|detector|measure/i;

    // --- 核心优化 A：修复 getBoundingClientRect 格式错误问题 ---
    Element.prototype.getBoundingClientRect = function() {
        const rect = originals.getBoundingClientRect.call(this);

        // 【性能优化】高效的长宽初筛，直接放行 99.9% 正常的页面布局元素
        if (rect.width >= 500 || rect.height >= 100 || rect.width === 0) {
            return rect;
        }

        // 检测是否为字体或指纹测量元素
        const id = this.id;
        const className = this.className;
        const isFontTest = (id && fontRegex.test(id)) || (typeof className === 'string' && fontRegex.test(className));

        if (isFontTest) {
            // 【安全修复】绝对不能直接返回 {} 字面量，必须使用 DOMRect.fromRect 保证完美的类型兼容，防止网页因类型检查崩溃
            if (window.DOMRect && typeof DOMRect.fromRect === 'function') {
                return DOMRect.fromRect({
                    x: rect.x,
                    y: rect.y,
                    width: rect.width + (Math.random() - 0.5) * 0.3,
                    height: rect.height + (Math.random() - 0.5) * 0.3
                });
            }
        }
        return rect;
    };

    // --- 核心优化 B：拦截更隐蔽的 offsetWidth 和 offsetHeight 字体指纹探测 ---
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')?.get;
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')?.get;

    if (originalOffsetWidth && originalOffsetHeight) {
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            get: function() {
                const width = originalOffsetWidth.call(this);
                // 只有小面积且名字命中的目标，才施加微妙噪点
                if (width > 0 && width < 500) {
                    const id = this.id;
                    const className = this.className;
                    if ((id && fontRegex.test(id)) || (typeof className === 'string' && fontRegex.test(className))) {
                        return width + (Math.random() > 0.5 ? 1 : -1); // 像素级轻微扰动
                    }
                }
                return width;
            },
            configurable: true
        });

        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            get: function() {
                const height = originalOffsetHeight.call(this);
                if (height > 0 && height < 100) {
                    const id = this.id;
                    const className = this.className;
                    if ((id && fontRegex.test(id)) || (typeof className === 'string' && fontRegex.test(className))) {
                        return height + (Math.random() > 0.5 ? 1 : -1);
                    }
                }
                return height;
            },
            configurable: true
        });
    }

    // --- 核心优化 C：全面封死现代高级字体检测 API ---
    if (window.FontFaceSet && FontFaceSet.prototype.check) {
        // 备份原始方法用于后期的还原
        originals.fontCheck = FontFaceSet.prototype.check;

        FontFaceSet.prototype.check = function(font, text) {
            // 现代高级指纹算法会调用 document.fonts.check("12px 'SomeRareFont'") 来直接肉测系统字体
            // 策略：如果是通用普通字体，返回真实值；如果是罕见的指纹探测字体，一律返回 false，假装用户没有安装
            const isCommonFont = /sans-serif|serif|mono|arial|helvetica|times|courier|tahoma|verdana/i.test(font);
            if (!isCommonFont) {
                return false; // 隐藏系统罕见的独立字体指纹
            }
            return originals.fontCheck.call(this, font, text);
        };
    }
}

// 反webRTC IP指纹
function block_webRTC_pr(){
    try {
        const originalRTC = originals.RTCPeerConnection?.value || window.RTCPeerConnection;
        if (!originalRTC) return;

        // 使用 Proxy 伪造构造函数
        const ProxyRTCPeerConnection = new Proxy(originalRTC, {
            construct(target, args) {
                // 创建一个真正的 RTC 实例，确保原型链 (instanceof) 完美合规
                const instance = Reflect.construct(target, args);

                // 使用 Proxy 劫持这个实例的方法，使其无法获取真实 IP
                return new Proxy(instance, {
                    get(obj, prop) {
                        // 拦截创建 DataChannel（很多指纹库通过它拿本地内网IP）
                        if (prop === 'createDataChannel') {
                            return () => ({ close: () => {}, send: () => {}, readyState: 'closed' });
                        }
                        // 拦截 Offer 和 Answer
                        if (prop === 'createOffer' || prop === 'createAnswer') {
                            return () => Promise.reject(new Error('WebRTC is disabled for privacy.'));
                        }
                        // 拦截 ICE 候选（防泄漏核心）
                        if (prop === 'localDescription' || prop === 'remoteDescription') {
                            return null;
                        }

                        // 其他属性如果需要函数绑定 this
                        const value = obj[prop];
                        if (typeof value === 'function') {
                            return value.bind(obj);
                        }
                        return value;
                    }
                });
            }
        });

        // 替换全局对象，必须设为 configurable: true 允许还原！
        Object.defineProperty(window, 'RTCPeerConnection', {
            value: ProxyRTCPeerConnection,
            configurable: true, // 【关键】必须为 true，否则 restore_originals() 会报错失效
            writable: true,
            enumerable: false
        });

        if (window.webkitRTCPeerConnection) {
            Object.defineProperty(window, 'webkitRTCPeerConnection', {
                value: ProxyRTCPeerConnection,
                configurable: true, // 【关键】必须为 true
                writable: true,
                enumerable: false
            });
        }

    } catch(e) {
        console.warn('[WebRTC 反指纹] 禁用失败:', e);
    }
}


// init
(function (){
    // 监听来自 ISOLATED 世界（扩展桥梁）的消息
    // 注意：V3有时序等级，不要过度Hook防御所谓的插件实效问题。
    window.addEventListener("message", (event) => {
        // 安全检查：只接收来自当前窗口，且类型正确的内部消息
        if (event.source !== window || !event.data || event.data.type !== "FROM_EXTENSION_STORAGE") {
            return;
        }
        const mode = event.data.mode;
        const stringID = event.data.stringID || "id#000000000"; // 从扩展中获取当前账户的隔离ID
        //
        if (mode === 'on') {
            // 电脑硬件
            block_device_pr_base();
            block_webRTC_pr();
            // 浏览器特性
            block_device_pr_upper();
            block_canvas_pr(stringID);
            block_css_pr();
        }else if (mode === 'base') {
            // 电脑硬件
            block_device_pr_base();
            block_webRTC_pr();
        }else{ // off
            // 如果用户在 Popup 里关掉了，我们就把 Hook 还原
            restore_originals();
        }
    });
})();