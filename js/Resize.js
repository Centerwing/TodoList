function resizeRoot() {
    let deviceWidth = document.documentElement.clientWidth;  // 获得设备宽度
    let maxWidth = 750;

    if (deviceWidth > maxWidth) {
        deviceWidth = maxWidth;
    }
    document.documentElement.style.fontSize = deviceWidth / 35 + "px";
}

resizeRoot();

window.onresize = function () {
    resizeRoot();
};