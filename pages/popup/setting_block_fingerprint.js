// 设置参数
// 设置 target mode 选中

let currentRadioMode = 'off'; // 取值范围：'off' 'on'
let block_fingerprint_alert_timer = 0;

// ele
const modeDefault = document.getElementById('modeDefault');
const modeBlank = document.getElementById('modeBlank');
const block_fingerprint_alert = document.getElementById('radio-block_fingerprint-alert');
const radioAlert = document.getElementById('radioAlert');

// 渲染选中UI
function show_block_fingerprint_radio() {
    func.get_data("block_fingerprint_mode").then(mode => {
        currentRadioMode = mode;
        // 更新UI选中样式
        if (mode === 'on') {
            modeBlank.checked = true;
        } else { // off or ""
            modeDefault.checked = true;
        }
    });
}

// 保存模式数据
function set_block_fingerprint_radio_mode(mode) {
    currentRadioMode = mode;
    //
    clearTimeout(block_fingerprint_alert_timer);
    func.set_data('block_fingerprint_mode', mode).then(mode => {
        // alert
        block_fingerprint_alert.innerText = func.get_language("block_fingerprint_alert");
        radioAlert.classList.remove("hide");
        block_fingerprint_alert_timer = setInterval(() => {
            block_fingerprint_alert.innerText = "";
            radioAlert.classList.add("hide");
        }, 5000);
        //
        show_block_fingerprint_radio();
    });
}

// 监听Radio单选
modeDefault.addEventListener('change', async () => {
    if (modeDefault.checked) {
        set_block_fingerprint_radio_mode('off');
    }
});
modeBlank.addEventListener('change', async () => {
    if (modeBlank.checked) {
        set_block_fingerprint_radio_mode('on');
    }
});