/**
 * Created by cc on 2017/3/28.
 */
(function(win, $) {
  var sifu = win.Sifu = win.Sifu || {
    basePrefixURL: "",
    basePrefixImgUrl: "",
    module: {},
    // 城市编码  "340100"--合肥市   110100--北京
    city_code:'110100',
    // 区块开始颜色
    start_color:'#9292e3',
    // 区块结束颜色
    end_color:'#131396',
    // 鼠标悬浮颜色
    over_color:'#f5f525',
    // 区块的透明度
    fill_opacity:0.8,
    // 市监控的循环时间
    shi_time:2000,
    // 区监控的循环时间
    qu_time:2000,
    // 设备追踪循环时间
    moniter_time:2000,
  }
})(window, jQuery);
