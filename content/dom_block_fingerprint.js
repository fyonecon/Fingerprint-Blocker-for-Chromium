'use strict';
// 拦截浏览器硬件指纹

// 硬件特性反指纹
function block_device_pr() {
    // 1. deviceMemory - 直接删除
    if ('deviceMemory' in navigator) {
        delete navigator.deviceMemory;
    }

    // 2. oscpu - 直接删除
    if ('oscpu' in navigator) {
        delete navigator.oscpu;
    }

    // 3. webdriver - 设置为 false
    if ('webdriver' in navigator) {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
            configurable: false
        });
    }

    // 4. language 和 languages - 保留前两位
    const originalLanguages = navigator.languages;
    if (originalLanguages && originalLanguages.length > 0) {
        const trimmedLanguages = originalLanguages.slice(0, 2);

        Object.defineProperty(navigator, 'languages', {
            get: () => trimmedLanguages,
            configurable: false
        });

        Object.defineProperty(navigator, 'language', {
            get: () => trimmedLanguages[0],
            configurable: false
        });
    }

    // 5. mimeTypes：标准化为只包含 PDF
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
            }
        };

        Object.defineProperty(navigator, 'mimeTypes', {
            get: () => standardMimeTypes,
            configurable: false
        });
    }

    // 6. plugins：标准化为只包含 PDF 插件
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
            refresh: function() {}
        };

        Object.defineProperty(navigator, 'plugins', {
            get: () => standardPlugins,
            configurable: false
        });
    }

    // 7. connection：智能 Wi-Fi（修正网速值）
    if ('connection' in navigator) {
        Object.defineProperty(navigator, 'connection', {
            get: () => {
                const hour = new Date().getHours();
                const isSlowTime = (hour >= 10 && hour <= 15) || (hour >= 17 && hour <= 22);

                if (isSlowTime) {
                    return {
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
                } else {
                    return {
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
                }
            },
            configurable: false
        });
    }

    // 验证输出
    console.log('[反指纹] 标准化完成:', {
        deviceMemory: navigator.deviceMemory,
        webdriver: navigator.webdriver,
        mimeTypes: {
            length: navigator.mimeTypes?.length,
            types: navigator.mimeTypes ? [...navigator.mimeTypes].map(m => m.type) : []
        },
        plugins: {
            length: navigator.plugins?.length,
            names: navigator.plugins ? [...navigator.plugins].map(p => p.name) : []
        },
        connection: {
            type: navigator.connection?.type,
            rtt: navigator.connection?.rtt,
            downlink: navigator.connection?.downlink
        }
    });
}

// 带缓存的阶梯形的随机canvas噪点反指纹
function block_canvas_pr() {
    const originalGetImageData = HTMLCanvasElement.prototype.getImageData;
    const resultCache = new WeakMap();  // 缓存修改结果

    HTMLCanvasElement.prototype.getImageData = function(...args) {
        // 检查缓存
        if (resultCache.has(this)) {
            const cached = resultCache.get(this);
            // 检查参数是否匹配
            if (cached.args && cached.args.every((v, i) => v === args[i])) {
                return cached.result;
            }
        }

        // 原始调用
        const imageData = originalGetImageData.apply(this, args);

        if (!imageData || !imageData.data) return imageData;

        // 添加噪点
        const data = imageData.data;
        const pixelCount = data.length / 4;

        let modifyRate, noiseStrength;
        if (pixelCount <= 4096) {
            modifyRate = 0.03;
            noiseStrength = 2;
        } else if (pixelCount <= 16384) {
            modifyRate = 0.01;
            noiseStrength = 1.5;
        } else {
            modifyRate = 0.002;
            noiseStrength = 1;
        }

        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < modifyRate) {
                const offset = (Math.random() - 0.5) * noiseStrength * 2;
                data[i] = Math.min(255, Math.max(0, data[i] + offset));
                data[i+1] = Math.min(255, Math.max(0, data[i+1] + offset));
                data[i+2] = Math.min(255, Math.max(0, data[i+2] + offset));
            }
        }

        // 存入缓存
        resultCache.set(this, {
            args: [...args],
            result: imageData
        });

        return imageData;
    };

    console.log('[Canvas 反指纹] 已启用（带缓存）');
}

// 反CSS指纹（轻微）
function block_css_pr() {
    // 1. 覆盖媒体查询
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
        // 固定深色模式/浅色模式（随机选择一个，保持一致）
        if (query.includes('prefers-color-scheme')) {
            return originalMatchMedia('(prefers-color-scheme: light)');
        }
        if (query.includes('prefers-contrast')) {
            return originalMatchMedia('(prefers-contrast: no-preference)');
        }
        if (query.includes('prefers-reduced-motion')) {
            return originalMatchMedia('(prefers-reduced-motion: no-preference)');
        }
        return originalMatchMedia.call(this, query);
    };

    // 2. 字体检测防御（给字体测量添加微小偏移）
    const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function() {
        const rect = originalGetBoundingClientRect.call(this);

        // 检测是否为字体测量元素（通常很小且隐藏）
        const isFontTest = (this.id && (this.id.toLowerCase().includes('font') ||
                this.id.toLowerCase().includes('test'))) ||
            (this.className && typeof this.className === 'string' &&
                (this.className.toLowerCase().includes('font') ||
                    this.className.toLowerCase().includes('test')));

        if (isFontTest && rect.width < 500 && rect.height < 100) {
            // 添加微小偏移（改变哈希但人眼不可见）
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width + (Math.random() - 0.5) * 0.3,
                height: rect.height + (Math.random() - 0.5) * 0.3,
                top: rect.top,
                bottom: rect.bottom,
                left: rect.left,
                right: rect.right
            };
        }
        return rect;
    };

    console.log('[CSS反指纹] 已启用');
}

// init
(function (){
    func.get_data("block_fingerprint_mode").then(mode => {
        currentRadioMode = mode;
        // 更新UI选中样式
        if (mode === 'on') {
            block_device_pr();
            block_canvas_pr()
            block_css_pr();
        } else { // off or ""
            console.log("使用默认或关闭了。mode=", mode);
        }
    });
})();