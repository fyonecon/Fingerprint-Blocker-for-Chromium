// 公共函数
const func = {
    console_log: function (...log) {
        if (config.console_debug){
            console.log("["+config.app_name+"日志Log] ", log);
        }
    },
    console_warn: function (...log) {
        if (config.console_debug){
            console.warn("["+config.app_name+"日志warn] ", ...log);
        }
    },
    // console_error: function (...log) { // 错误就在页面或控制台直接显示
    //     if (config.console_debug){
    //         console.error("["+config.app_name+"日志Error] ", ...log);
    //     }
    // },
    get_data:function(key="") { // 读取数据
        key = config.app_class + key;
        return new Promise((resolve)=>{
            if (typeof chrome !== 'undefined'){
                chrome.storage.local.get([key], (res) => {
                    if (res[key] !== undefined) {
                        resolve(res[key]);
                    } else {
                        resolve("");
                    }
                });
            }else{
                resolve("");
            }
        });
    },
    set_data:function(key="", value=null) { // 保存数据
        key = config.app_class + key;
        return new Promise((resolve)=>{
            if (typeof chrome !== 'undefined'){
                chrome.storage.local.set({ [key]: value }, () => {
                    resolve(value);
                });
            }else{
                resolve("");
            }
        });
    },
    del_data: function(key="") { // 删除数据
        key = config.app_class + key;
        return new Promise((resolve)=>{
            if (typeof chrome !== 'undefined'){
                chrome.storage.local.remove([key], () => {
                    resolve(true);
                });
            }else{
                resolve(false);
            }
        });
    },
    clear_data: function() { // 清空数据
        return new Promise((resolve)=>{
            if (typeof chrome !== 'undefined'){
                chrome.storage.local.clear(() => {
                    resolve(true);
                });
            }else{
                resolve(false);
            }
        });
    },
    is_url: function (string=""){ // http(s) ftp(s) file
        string = string.toLowerCase();
        if (
            string.indexOf("http:") === 0
            || string.indexOf("https:") === 0
            || string.indexOf("ftp:") === 0
            || string.indexOf("ftps:") === 0
            || string.indexOf("file:") === 0
            // || string.indexOf("view-source:") === 0
            || string.indexOf("mailto:") === 0
            || string.indexOf("rtsp:") === 0
            || string.indexOf("tel:") === 0
            || string.indexOf("sms:") === 0
        ){ // 严格限制协议开头
            try {
                new URL(string);
                return true;
            } catch (err) {
                return false;
            }
        }else{
            return false;
        }
    },
    get_language: function(key="_null") {
        // 获取语言
        function sys_lang(){
            return (navigator.language || "en").toLowerCase();
        }
        // 将语言转换成可用的数组索引标记
        function make_lang_index(_language){
            if (_language.indexOf("zh") >= 0) { // 简体中文（包含繁体）
                return "zh";
            }
            else if (_language.indexOf("en") >= 0){ // 英文
                return "en";
            }
            else if (_language.indexOf("jp") >= 0 || _language.indexOf("ja") >= 0){ // 日文
                return "jp";
            }
            // else if (_language.indexOf("fr") >= 0){ // 法语
            //     return "fr";
            // }
            else if (_language.indexOf("de") >= 0){ // 德语
                return "de";
            }
            // else if (_language.indexOf("ru") >= 0){ // 俄语或乌克兰语
            //     return "ru";
            // }
            // else if (_language.indexOf("es") >= 0){ // 西班牙语
            //     return "es";
            // }
            // else if (_language.indexOf("ko") >= 0){ // 韩语或朝鲜语
            //     return "ko";
            // }
            else if (_language.indexOf("vi") >= 0){ // 越语
                return "vi";
            }
            else{ // 默认英文
                return "en"
            }
        }
        // 简化的语言
        const index_lang = make_lang_index(sys_lang());
        // 确保有值返回
        const key_lang = language_dict[key];
        if (!key_lang){ // 无key
            return "_[" + key + "]_";
        }else{
            const value_lang = language_dict[key][index_lang];
            if (!value_lang){
                return language_dict[key]["en"];
            }else{
                return value_lang;
            }
        }
    },
    get_theme: function () { // 获取主题
        // 确保 window.matchMedia 存在
        if (typeof window !== "undefined" && window.matchMedia) {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            return isDark?"dark":"light";
        } else {
            return "light";
        }
    },
    is_extension: function (){ // 页面处于浏览器插件运行环境
        if (typeof chrome !== 'undefined'){
            return !!chrome.runtime.id;
        }else{
            return false;
        }
    },
    get_extension_id: function(){
        if (typeof chrome !== 'undefined'){
            return chrome.runtime.id;
        }else{
            return "";
        }
    },
    get_pathname: function(){ // 路由
        if (typeof window !== "undefined"){
            const url = new URL(window.location.href);
            return url.pathname;
        }else {
            return "";
        }
    },
    get_search: function(){ // 路由参数
        if (typeof window !== "undefined"){
            const url = new URL(window.location.href);
            return url.search;
        }else {
            return "";
        }
    },
    set_language_span: function(){ // span类型的翻译
        if (typeof document !== 'undefined'){
            const spans = document.getElementsByClassName("language-span");
            for (let i = 0; i < spans.length; i++) {
                const the_span = spans[i];
                const the_key = the_span.getAttribute("data-language_key");
                the_span.innerText = func.get_language(the_key);
            }
        }else{
            console.warn("document is not supported!");
        }
    },
    set_language_input_placeholder: function(){ // input placeholder类型翻译
        if (typeof document !== 'undefined') {
            const inputs = document.getElementsByClassName("language-input");
            for (let i = 0; i < inputs.length; i++) {
                const the_input = inputs[i];
                const the_key = the_input.getAttribute("data-language_key");
                the_input.setAttribute("placeholder", func.get_language(the_key));
            }
        }else{
            console.warn("document is not supported!");
        }
    },
    set_language_textarea_placeholder: function(){ // textarea placeholder类型翻译
        if (typeof document !== 'undefined') {
            const textareas = document.getElementsByClassName("language-textarea");
            for (let i = 0; i < textareas.length; i++) {
                const the_textarea = textareas[i];
                const the_key = the_textarea.getAttribute("data-language_key");
                the_textarea.setAttribute("placeholder", func.get_language(the_key));
            }
        }else{
            console.warn("document is not supported!");
        }
    },
    set_language_title: function(key){ // title类型翻译
        if (typeof document !== 'undefined' && document.title !== undefined) {
            document.title = func.get_language(key);
        }else{
            console.warn("document is not supported!");
        }
    },
    goto_href: function(href, target="_replace"){ // 打开网址
        let that = this;
        //
        if (typeof window !== 'undefined') {
            if (target === "_self"){
                window.location.href = href;
            }else if (target === "_blank"){
                window.open(href, "_blank");
            }else{
                window.location.replace(href);
            }
        }
    },
    string_to_unicode: function(string) {
        let that = this;
        // 处理非字符串输入
        if (typeof string !== 'string') {
            string = String(string);
        }
        if (string.length === 0) return "";

        // 使用数组收集编码，然后join，效率更高
        let codes = [""]; // 默认一个空值可以避免多次转换丢失一个值
        for (let i = 0; i < string.length; i++) {
            codes.push(string.charCodeAt(i));
        }
        return codes.join(',');
    },
    unicode_to_string: function(unicode) {
        let that = this;
        // 处理无效输入
        if (unicode === null || unicode === undefined) {
            return "";
        }

        // 如果是数字，直接转换
        if (typeof unicode === 'number') {
            return String.fromCharCode(unicode);
        }

        // 确保是字符串
        unicode = String(unicode).trim();
        if (unicode === "") return "";

        try {
            // 处理逗号分隔的Unicode序列
            if (unicode.indexOf(',') !== -1) {
                let parts = unicode.split(',');
                let result = [];

                for (let i = 0; i < parts.length; i++) {
                    let part = parts[i].trim();
                    // 跳过空部分
                    if (part === "") continue;

                    // 转换为数字
                    let code = Number(part);
                    // 验证是否为有效Unicode码点
                    if (isNaN(code) || code < 0 || code > 0x10FFFF) {
                        // 无效编码，返回原字符串
                        return unicode;
                    }
                    result.push(String.fromCharCode(code));
                }

                return result.join('');
            } else {
                // 处理单个Unicode码点
                let code = Number(unicode);
                let _unicode = "";
                // 验证是否为有效Unicode码点
                if (!isNaN(code) && code >= 0 && code <= 0x10FFFF) {
                    _unicode = String.fromCharCode(code);
                }else{
                    _unicode = unicode;
                }
                // 比较值
                if (that.string_to_unicode(unicode) === unicode){
                    return _unicode;
                }else{
                    return unicode;
                }
            }
        } catch (e) {
            // 任何错误都返回原字符串
            return unicode;
        }
    },
    get_time_s: function () {
        return Math.floor((new Date()).getTime()/1000);
    }, // 秒时间戳，s
    get_time_ms: function(){
        return (new Date()).getTime();
    }, // 毫秒时间戳，ms
    get_time_date: function(format){ // Ymd His
        let that = this;
        return that.get_time_s_date(format, "");
    },
    get_time_s_date: function(format, time_s){ // YmdHisW，日期周
        let that = this;
        let t;
        if (!time_s){
            t = new Date();
        }else {
            t = new Date(time_s*1);
        }
        let seconds = t.getSeconds(); if (seconds<10){seconds = "0"+seconds;}
        let minutes = t.getMinutes(); if (minutes<10){minutes = "0"+minutes;}
        let hour = t.getHours(); if (hour<10){hour = "0"+hour;}
        let day = t.getDate(); if (day<10){day = "0"+day;}
        let month = t.getMonth() + 1; if (month<10){month = "0"+month;}
        let year = t.getFullYear();
        let week = ["week1", "week2", "week3", "week4", "week5", "week6", "week7"][t.getDay()]; // 周

        format = format.replaceAll("Y", year);
        format = format.replaceAll("m", month);
        format = format.replaceAll("d", day);
        format = format.replaceAll("H", hour);
        format = format.replaceAll("i", minutes);
        format = format.replaceAll("s", seconds);
        format = format.replaceAll("W", week);

        return format;
    },
    get_time_ms_format: function (format, time_ms){ // 毫秒时间戳转日期
        let that = this;
        if (!time_ms){
            time_ms = that.get_time_ms();
        }else{
            time_ms = time_ms*1;
        }
        return this.get_time_s_date(format, time_ms);
    },
    format_date: function (new_format, date){ // (只YmdHis格式, 新YmdHis格式)
        date = date+""; // 必须string
        let year = date.slice(0,4);
        let month = date.slice(4,6);
        let day = date.slice(6,8);
        let hour = date.slice(8,10);
        let minutes = date.slice(10,12);
        let seconds = date.slice(12,14);

        let format = new_format;

        format = format.replaceAll("Y", year);
        format = format.replaceAll("m", month);
        format = format.replaceAll("d", day);
        format = format.replaceAll("H", hour);
        format = format.replaceAll("i", minutes);
        format = format.replaceAll("s", seconds);

        return format;
    },
    js_rand: function (min, max) { // [min, max]
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    md5: function(str) {
        return md5_string(str);
    },
    make_app_uid: function(){
        let that = this;
        //
        let only_string = that.get_time_ms().toString() + "#" + this.js_rand(10000000, 999999999).toString() + "#" + navigator.userAgent.toLowerCase();
        return that.md5(config.app_class+only_string);
    },
    is_ios: function () {
        const ua = navigator.userAgent.toLowerCase();
        return (/iphone/i.test(ua)) || (/ipad/i.test(ua)) || (/ipod/i.test(ua));
    } ,
    is_android: function (){
        const ua = navigator.userAgent.toLowerCase();
        return ( (/android/i).test(ua) ) || ( (/hm/i).test(ua) || (/harmony/i).test(ua) );
    },
    is_mac: function (){
        let that = this;
        const ua = navigator.userAgent.toLowerCase();
        return ( (/macintosh/i.test(ua)) || (/mac os x/i.test(ua)) ) && !that.is_ios();
    },
    is_win: function (){
        const ua = navigator.userAgent.toLowerCase();
        return (/windows/i).test(ua);
    },
    is_linux: function (){
        let that = this;
        const ua = navigator.userAgent.toLowerCase();
        return (/linux/i).test(ua) && !that.is_android;
    },
    is_firefox: function (){
        const ua = navigator.userAgent.toLowerCase();

        let js_runtime_state = false;
        try {
            js_runtime_state = CSS.supports("-moz-appearance", "none");
        }catch(e){}

        return (/firefox/i.test(ua)) || (/fx/i.test(ua)) || js_runtime_state;
    },
    is_edge: function (){
        const ua = navigator.userAgent.toLowerCase();
        return (/edg/i.test(ua));
    },
    is_brave: function (){
        const ua = navigator.userAgent.toLowerCase();
        let js_runtime_state = false;
        try { js_runtime_state = (navigator.brave || typeof navigator.brave.isBrave === 'function'); }catch(e){}
        return ( /brave/i.test(ua) || js_runtime_state );
    },
    is_samsung: function (){
        const ua = navigator.userAgent.toLowerCase();
        return (/samsung/i.test(ua));
    },
    is_chrome: function (){ // 仅是Chrome本尊
        let that = this;
        const ua = navigator.userAgent.toLowerCase();
        //
        // const isFirefox = (/firefox/i.test(ua)) || (/fx/i.test(ua));
        const isChrome = (/chrome/i.test(ua)) || (/ch/i.test(ua));
        const isEdge = (/edg/i.test(ua)) || (/bing/i.test(ua)); // 包含老Edge
        const isBrave = (/brave/i.test(ua));
        const isYandex = (/ya/i.test(ua));
        const isOpera = (/opera/i.test(ua)) || (/opr/i.test(ua)) || (/opt/i.test(ua));
        const isSamsung = (/samsung/i.test(ua));
        const isDuckDuckGo = (/duckDuckGo/i.test(ua)) || (/ddg/i.test(ua));
        const isMeta = (/facebook/i.test(ua)) || (/ins/i.test(ua)) || (/meta/i.test(ua));
        // 盲
        const isAI = (/ai/i.test(ua));
        const isBuild = (/build/i.test(ua)) || (/com/i.test(ua)) || (/cn/i.test(ua)) || (/dev/i.test(ua));
        // 国内
        const isQQ = (/qq/i.test(ua)) || (/qqbrowser/i.test(ua));
        const isUC = (/uc/i.test(ua));
        const isSogou = (/sogou/i.test(ua));
        const isVivaldi = (/vivaldi/i.test(ua));
        const isQuark = (/quark/i.test(ua));
        const isBaidu = (/baidu/i.test(ua));
        const isMaxthon = (/maxthon/i.test(ua));
        const is360 = (/360/i.test(ua));
        const isLiebao = (/lb/i.test(ua));
        const isMeituan = (/meituan/i.test(ua)) || (/mt/i.test(ua));
        const isDouyin = (/douyin/i.test(ua)) || (/tiktok/i.test(ua)) || (/byte/i.test(ua)) || (/aweme/i.test(ua)) || (/news/i.test(ua)) || (/toutiao/i.test(ua));
        //
        return isChrome && !( isEdge || isBrave || isBrave || isYandex || isOpera || isSamsung || isDuckDuckGo || isMeta || isAI || isBuild || isQQ || isUC || isSogou || isVivaldi || isQuark || isQuark || isBaidu || isMaxthon || is360 || isLiebao || isMeituan || isDouyin);
    },
    is_safari: function (){ // 仅是Safari本尊
        let that = this;
        const ua = navigator.userAgent.toLowerCase();
        //
        const isAppleWebKit = /applewebKit/i.test(ua);
        // 排除其他浏览器
        // 国际
        const isFirefox = (/firefox/i.test(ua)) || (/fx/i.test(ua));
        const isChrome = (/chrome/i.test(ua)) || (/ch/i.test(ua));
        const isEdge = (/edg/i.test(ua)) || (/bing/i.test(ua)); // 包含老Edge
        const isBrave = (/brave/i.test(ua));
        const isYandex = (/ya/i.test(ua));
        const isOpera = (/opera/i.test(ua)) || (/opr/i.test(ua)) || (/opt/i.test(ua));
        const isSamsung = (/samsung/i.test(ua));
        const isDuckDuckGo = (/duckDuckGo/i.test(ua)) || (/ddg/i.test(ua));
        const isMeta = (/facebook/i.test(ua)) || (/ins/i.test(ua)) || (/meta/i.test(ua));
        // 盲
        const isAI = (/ai/i.test(ua));
        const isBuild = (/build/i.test(ua)) || (/com/i.test(ua)) || (/cn/i.test(ua)) || (/dev/i.test(ua));
        // 国内
        const isQQ = (/qq/i.test(ua)) || (/qqbrowser/i.test(ua));
        const isUC = (/uc/i.test(ua));
        const isSogou = (/sogou/i.test(ua));
        const isVivaldi = (/vivaldi/i.test(ua));
        const isQuark = (/quark/i.test(ua));
        const isBaidu = (/baidu/i.test(ua));
        const isMaxthon = (/maxthon/i.test(ua));
        const is360 = (/360/i.test(ua));
        const isLiebao = (/lb/i.test(ua));
        const isMeituan = (/meituan/i.test(ua)) || (/mt/i.test(ua));
        const isDouyin = (/douyin/i.test(ua)) || (/tiktok/i.test(ua)) || (/byte/i.test(ua)) || (/aweme/i.test(ua)) || (/news/i.test(ua)) || (/toutiao/i.test(ua));
        //
        const agent_state = isAppleWebKit && (that.is_ios() || that.is_mac()) && !(that.is_android() || that.is_win() || that.is_linux()) && !( isFirefox || isChrome || isEdge  || isBrave || isBrave || isYandex || isOpera || isSamsung || isDuckDuckGo || isMeta || isAI || isBuild || isQQ || isUC || isSogou || isVivaldi || isQuark || isQuark || isBaidu || isMaxthon || is360 || isLiebao || isMeituan || isDouyin);
        //
        let js_runtime_state = false;
        try {
            js_runtime_state = ((typeof safari !== "undefined") || (CSS.supports("font", "-apple-system-body")));
        }catch(e){
            js_runtime_state = CSS.supports("font", "-apple-system-body");
        }

        return agent_state || js_runtime_state;
    },
    get_runtime_info: function() {
        let that = this;
        //
        return {
            "sys_platform": that.is_win() ? "Win" : (that.is_mac() ? "Mac" : that.is_android()?"Android":(that.is_ios()?"iOS/iPad":(that.is_linux()?"Linux":("Others")))),
            "browser_name": that.is_firefox() ? "Firefox" : (that.is_edge() ? "Edge" : (that.is_chrome() ? "Chrome" : (that.is_brave() ? "Brave" : (that.is_samsung()?"Samsung":(that.is_safari()?"Safari":"Others"))))),
        };
    },
};