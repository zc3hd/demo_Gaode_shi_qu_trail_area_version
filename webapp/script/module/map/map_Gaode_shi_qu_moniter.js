/**
 * Item Name  : 
 *Creator         :cc
 *Email            :cc
 *Created Date:2017/3/28
 *@pararm     :
 */
(function($, window) {
  function diyBdMap(opts) {
    this.id = opts.id;
    this.newTools = null;
    //登录用户标识
    this.ret = null;
    // ----------------市下的区监控层
    this._shi_jk_timer = null;
    // 市监控下的区块数组
    this._shi_jk_arr = [];


    // ----------------区下的监控层
    //点击的区
    this.s_ = null;
    //区监控层计时器
    this._jk_timer = null;
    //区的最佳视角
    this._jk_view = true;

    //------------------追踪
    this.t_outBtn = null;
    //追踪的定时器
    this._trail_timer = null;
    //追踪的marker容器
    this._trail_marker = null;

    // ------------------各种循环器的安全开关
    // 区块
    this.polygon_click_key = false;
    // 区县的监控
    this.marker_click_key = false;
    // 追踪
    this.trail_out_key = false;

    //景区模拟数据
    this.s_data = {
      districts: [
        { "adcode": '110101', "num": 2 },
        { "adcode": '110102', "num": 3 },
        { "adcode": '110105', "num": 12 },
        { "adcode": '110106', "num": 15 },
        { "adcode": '110107', "num": 30 },
        { "adcode": '110108', "num": 2 },
        { "adcode": '110109', "num": 52 },
        { "adcode": '110112', "num": 45 },
        { "adcode": '110111', "num": 45 },
        { "adcode": '110113', "num": 87 },
        { "adcode": '110115', "num": 454 },
        { "adcode": '110114', "num": 74 },
        { "adcode": '110117', "num": 20 },
        { "adcode": '110116', "num": 23 },
        { "adcode": '110119', "num": 20 },
        { "adcode": '110118', "num": 52 },
      ],
      ret: 1,
    };

    //各个区下的数据
    this.s1_data = {
      bikes: [
        { "id": 4, "position": { "lng": 116.364384, "lat": 39.980178, } },
        { "id": 5, "position": { "lng": 116.377679, "lat": 39.97675, } },
      ]
    };

    this.s2_data = {
      bikes: [
        { "id": 6, "position": { "lng": 116.485422, "lat": 39.952183, } },
        { "id": 7, "position": { "lng": 116.486787, "lat": 39.950178, } },
        { "id": 8, "position": { "lng": 116.482278, "lat": 39.952224, } },
      ]
    };

    this.s3_data = {
      bikes: [
        { "id": 9, "position": { "lng": 116.409551, "lat": 39.908896, } },
        { "id": 10, "position": { "lng": 116.407674, "lat": 39.909352, } },
      ]
    };

    this.s_bikeData = [this.s1_data, this.s2_data, this.s3_data];
  };
  diyBdMap.prototype = {
    //面向对象初始化
    init: function() {
      var me = this;
      me.init_Baner(); //开启控件
      setTimeout(function() {
        me.init_event();
      }, 500);
    },
    //控件默认初始化
    init_Baner: function() {
      var me = this;
      var map = me.map = new AMap.Map(me.id, {
        // mapStyle:'dark',
        // features:[]
      });

      // map.centerAndZoom(new BMap.Point(116.404, 39.915), 12); 
      map.setZoomAndCenter(11, [116.404, 39.915]);
    },

    init_event: function() {
      var me = this;
      me.scenic_bind();
      me.scenic();
    },
    scenic: function() {
      var me = this;
      me.s_ajax();
    },
    scenic_bind: function() {
      var me = this;
      var fn = {
        //请求回景点数据
        s_ajax: function() {
          var me = this;

          //API.baidu.scenic().done(function (data) {
          //    me.ret = data.ret;
          //    me.map.clearOverlays();
          //    if(data.ret==1){
          //        me.s_draw(data.ScenicCompany);
          //    }
          //    else if(data.ret==2){
          //
          //    }
          //});

          // 要把异步请求的数据挂载到全局在进行异步方式请求区块
          var data = me.s_data;
          me.ret = data.ret;
          if (data.ret == 1) {
            // 清除地图所有覆盖物
            me.map.clearMap();
            // 异步的方式打区块
            me.s_draw_area();
          }
          // 市监控数据循环
          me.s_data_timeout();

        },
        //---------------------------------------------------------------市区模块监控
        // 市监控数据循环
        s_data_timeout: function(argument) {
          var me = this;
          var doms = me._shi_jk_arr;
          if (doms.length != 0) {
            // 请求的数据挂载到全局
            me.s_data = me.s_data;
            for (var i = 0; i < doms.length; i++) {
              // 数据绑定
              me._district_ajax_data_bind(doms[i]);
            }
          }
          me._shi_jk_timer = setTimeout(function(argument) {
            if (!me.polygon_click_key) {
              console.log('市监控数据渲染')
              me.s_data_timeout();
            }
          }, Sifu.shi_time);

        },
        // 异步的方式打区块
        s_draw_area: function() {
          var me = this;
          // 加载工具
          AMap.service('AMap.DistrictSearch', function() {
            var district = new AMap.DistrictSearch({
              subdistrict: 1, //返回下一级行政区
              level: 'city',
              showbiz: false, //是否显示商圈
              // 返回边界显示
              extensions: 'all'
            });
            //市编码查询
            district.search(Sifu.city_code, function(status, result) {
              if (status == 'complete') {
                // getData(result.districtList[0]);
                me.map.on('mousemove', function(argument) {
                  $("#info").css({ "top": (argument.pixel.y + 5) + "px", "left": (argument.pixel.x + 5) + "px" });
                });
                // $('.amap-controls').hide();
                // 影藏地图
                me.map.setFeatures([]);
                // 处理城市列表
                me._district_date(result.districtList[0]);
              }
            });
          });
        },
        // 区数据处理
        _district_date: function(data) {
          var me = this;
          // 区列表
          var subList = data.districtList;
          // 颜色生成器
          var gradient = new gradientColor(Sifu.start_color, Sifu.end_color, subList.length);
          for (var k = 0; k < subList.length; k++) {
            // 区块生成
            me._district_gen(subList[k], gradient[k]);
          }
        },
        // 区块生成
        _district_gen: function(data, color) {
          var me = this;
          var district = new AMap.DistrictSearch({
            //返回下一级行政区
            subdistrict: 0,
            level: 'district',
            //是否显示商圈
            showbiz: false,
            // 返回边界显示
            extensions: 'all'
          });
          // 市编码
          district.search(data.adcode, function(status, result) {
            if (status == 'complete') {
              me._district_gen_done(result.districtList[0], color);
            }
          });
        },
        // 具体区块生成的操作
        _district_gen_done: function(data, color) {
          var me = this;
          var bounds = data.boundaries;
          // 没有设置边界
          if (bounds) {
            for (var i = 0, l = bounds.length; i < l; i++) {
              var polygon = new AMap.Polygon({
                map: me.map,
                strokeWeight: 0,
                strokeColor: color,
                fillColor: color,
                fillOpacity: Sifu.fill_opacity,
                path: bounds[i]
              });
              polygon.name = data.name;
              polygon.adcode = data.adcode;
              // 绑定数据
              me._district_ajax_data_bind(polygon);

              polygon.on('mouseover', function(argument) {
                me.map.setDefaultCursor('pointer');
                polygon.fillColor = polygon.getOptions().fillColor;
                polygon.setOptions({ fillColor: Sifu.over_color });
                $("#info_name").html(polygon.name);
                $("#info_num").html('车数量： ' + polygon.num);

                $("#info").show();
              });
              polygon.on('mouseout', function(argument) {
                polygon.setOptions({ fillColor: polygon.fillColor });
                me.map.setDefaultCursor('auto');
                $("#info").hide();
              });
              polygon.on('click', function(argument) {
                // 点击了区县块--区块的实时数据循环就关闭了
                me.polygon_click_key = true;

                $("#info").hide();
                // 清除市监控
                clearTimeout(me._shi_jk_timer);
                me.map.clearMap();
                me.map.setFeatures(['bg', 'road', 'building']);
                // 加载退出事件
                me.s_out();
                // 点击marker
                me.s_click(polygon);
              });
              // 收集区块
              me._shi_jk_arr.push(polygon);

            }
            me.map.setFitView(); //地图自适应
          }
        },
        // 生成的区块和AJAX的数据进行绑定
        _district_ajax_data_bind: function(dom) {
          var me = this;
          // 拿到数据
          var arr = me.s_data.districts;
          if (arr.length != 0) {
            for (var d = 0; d < arr.length; d++) {
              if (dom.adcode == arr[d].adcode) {
                dom.num = arr[d].num;
                break;
              }
            }
          }
        },

        // ------------------------------------start--------------聚合版本的fn,本版本不用
        s_draw: function(data) {
          var me = this;
          if (me.ret == 1) {
            data.forEach(function(item) {
              // var convertData = me.convertCoord({ 'lng': item.lng, 'lat': item.lat });
              var marker = new AMap.Marker({
                icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                position: [item.lng, item.lat]
              });
              marker.setMap(me.map);
              marker.id = item.id;
              marker.name = item.name;
              marker.bikeQuantity = item.bikeQuantity;

              // 添加点击事件
              marker.on('click', function() {
                me.s_out();
                me.s_click(marker);
              });
              // 给marker设置label
              me.s_label(marker);
            });
            // 最优视角
            me.map.setFitView();
          }
        },
        // ------------------------------------end-------------聚合版本的fn,本版本不用
        //marker的信息框
        s_label: function(marker) {
          var me = this;
          // 自定义点标记内容
          var markerContent = document.createElement("div");
          markerContent.className = "P_div";
          // 点标记中的图标
          var markerImg = document.createElement("img");
          markerImg.className = "markerlnglat";
          markerImg.src = "./images/car_online.png";
          markerContent.appendChild(markerImg);

          // 标记中的信息框
          var markerDIV = document.createElement("div");
          markerDIV.className = 'markLabel';
          markerDIV.innerHTML = '<span class="labelName" id="devName">姓名：admin'+
            '<br />' +
            '<span class="" id="devReceive" >电话：13833335555</span>' +
            '<br />' +
            '</span>' +
            '<div class="labelArrow"></div>';
          markerContent.appendChild(markerDIV);

          marker.setContent(markerContent); //更新点标记内容
        },
        
        //区的点击事件
        s_click: function(marker) {

          // 记录下当前点击的景区marker
          me.s_ = marker;
          var data = null;

          // 通州区
          if (marker.adcode == '110112') {
            data = me.s1_data;
          }
          // 大兴区
          else if (marker.adcode == '110115') {
            data = me.s2_data;
          }

          me.map.clearMap();
          // 区下面的监控层数据
          me.s_jk_draw(data.bikes);
          // 初始设置为true ，第一次进行视角最优化，接下来关闭
          me._jk_view = false;
          me._jk_timer = setTimeout(function() {
            if (!me.marker_click_key) {
              console.log('区监控数据渲染');
              me.s_click(marker);
            }
          }, Sifu.qu_time);

          // 数据驱动
          data.bikes.forEach(function(item) {
            item.position.lng = item.position.lng + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
            item.position.lat = item.position.lat + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
          });
        },
        //------------------------------------------------------------------区监控数据
        s_jk_draw: function(data) {
          var me = this;
          data.forEach(function(item) {

            var marker = new AMap.Marker({
              position: [item.position.lng, item.position.lat],
              title: 'ID号:' + item.id,
              icon: new AMap.Icon({
                size: new AMap.Size(54, 46), //图标大小
                // imageSize:new AMap.Size(54, 46),
                image: "./images/car_online.png",
                // imageOffset: new AMap.Pixel(5, 5)
              })
            });



            // me.map.addOverlay(marker);
            marker.setMap(me.map);

            // 绑定marker的id
            marker.id = item.id;
            // 追踪模式
            marker.on('click', function(e) {
              // 点击marker--区监控循环就失效
              me.marker_click_key = true;
              // 点击了marker--追踪的循环就开启
              me.trail_out_key = false;

              var event = e || window.e;
              if (event && event.stopPropagation) {
                event.stopPropagation();
              } else {
                event.cancelBubble = true;
              }
              clearTimeout(me._jk_timer);
              // 退出到区的监控层
              me._trail_out();
              me.map.clearMap();
              me._trail(marker);
            });
          });
          if (me._jk_view) {
            // me.map.setViewport(geoPoints);
            me.map.setFitView();
          }
        },
        //退出到市监控层
        s_out: function() {

          var me = this;
          $('#p_btn').show();
          $('#p_btn').html('返回区监控');
          $('#p_btn').unbind().on('click', function() {
            clearTimeout(me._jk_timer);
            me.map.clearMap();
            $('#p_btn').hide();
            //点击了退出--区块的实时数据循环就打开了
            me.polygon_click_key = false;

            me._jk_view = true;
            me.s_ajax();
          });
        },
        //-------------------------------------------------------------------追踪
        _trail: function(marker) {
          //var opts = {
          //    bikeId:marker.id
          //};
          //API.baidu.b_trail(opts).done(function (data) {
          //    me.t_draw(data.bike);
          //    me.t_timer = setTimeout(function () {
          //        me.t_pContainer  = [];
          //        me.b_trail(marker);
          //    },2000);
          //});
          var data = {
            bike: {}
          };
          me.s_bikeData.forEach(function(item) {
            item.bikes.forEach(function(b_data) {
              if (b_data.id == marker.id) {
                data.bike = b_data;
                return;
              }
            })
          });
          // 拿到渲染数据
          me._trail_draw(data.bike);

          me._trail_timer = setTimeout(function() {
            if (!me.trail_out_key) {
              console.log('追踪数据渲染');
              me._trail(marker);
            }

          }, Sifu.moniter_time);


          data.bike.position.lng = data.bike.position.lng + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
          data.bike.position.lat = data.bike.position.lat + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
        },
        // 追踪渲染
        _trail_draw: function(item) {
          var me = this;
          if (me._trail_marker == null) {

            var marker = me._trail_marker = new AMap.Marker({
              position: [item.position.lng, item.position.lat],
              title: 'ID号:' + item.id,
              icon: new AMap.Icon({
                size: new AMap.Size(54, 46), //图标大小
                // imageSize:new AMap.Size(54, 46),
                image: "./images/car_online.png",
                // imageOffset: new AMap.Pixel(5, 5)
              })
            });
            me.s_label(marker)
            // me.map.addOverlay(marker);
            marker.setMap(me.map);
            marker.setOffset(new AMap.Pixel(-15, -48));

          } else {
            var newPoint = [item.position.lng, item.position.lat];
            var oldP = me._trail_marker.getPosition();
            var oldPoint = [oldP.lng, oldP.lat];

            me._trail_line([oldPoint, newPoint], {});
            me._trail_marker.setPosition(newPoint); //移动到新的数据点上
          }
          me.map.setFitView([me._trail_marker]);
        },
        //退出追踪层，进入区下面的监控层
        _trail_out: function() {
          var me = this;
          $('#p_btn').html('退出追踪');
          $('#p_btn').unbind().on('click', function() {
            clearTimeout(me._trail_timer);
            me.map.clearMap();
            $('#p_btn').hide();
            // 点击了退出追踪--追踪的循环就失效了。
            me.trail_out_key = true;
            // 点击了退出追踪--区块下监控循坏开启。
            me.marker_click_key = false;
            // 区下面的监控层的最优视角开启
            me._jk_view = true;

            me._trail_marker = null;
            me.s_out();
            // 进入当前记录下的区的marker，然后进入区下的监控
            me.s_click(me.s_);
          });
        },
        //追踪的线
        _trail_line: function(points, opts) {
          var me = this;
          var polyLine = new AMap.Polyline({
            path: points,
            strokeColor: (opts.color || "#21536d"),
            strokeWeight: (opts.weight || 4),
            strokeOpacity: (opts.opacity || 0.8)
          });
          polyLine.setMap(me.map);
        },
      };
      for (k in fn) {
        me[k] = fn[k];
      };
    },

  };
  window["diyBdMap"] = diyBdMap;
})(jQuery, window);
