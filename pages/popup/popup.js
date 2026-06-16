
// 页面起始函数
function page_start(e){
    // 生成随机UID（注意，此值仅用于匿名调试）
    // func.get_data("app_uid").then(uid => {
    //     if (!uid){func.set_data("app_uid", func.make_app_uid()).then(res =>{}) ;}
    // });
    // 页面翻译
    func.set_language_title("popup");
    func.set_language_span();

    // 初始化
    show_block_fingerprint_radio();

    //
    // let sys_platform = func.get_runtime_info()["sys_platform"];
    let browser_name = func.get_runtime_info()["browser_name"];
    // 其他
    document.getElementById("settings-item-title-version").innerText = "v"+config.app_version + " for " + browser_name;

}

// 页面加载完成后或页面可见时
(function (){
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", page_start);
    } else {
        page_start(2);
    }
    //
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) { // onHide
            //
        } else { // onShow
            page_start(3);
        }
    });
})();