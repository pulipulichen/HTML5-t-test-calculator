var _draw_box_plot = function (_variables) {
    // https://dc-js.github.io/dc.js/examples/box-plot.html
    
    //console.log(_variables);
    
    // ----------------------
    // 想辦法把variables轉換成experiments的資料吧
    var experiments = [];
    var _count = 0;
    for (var _name in _variables) {
        var _values = _variables[_name];
        _count++;
        for (var _v = 0; _v < _values.length; _v++) {
            experiments.push({
                "Expt": _name,
                "Speed": _values[_v]
            });
        }
    }
    
    // -----------------------
    
    var _box_plot = $("#box_plot").empty();
    if (_box_plot.length === 0) {
        _box_plot = $('<div id="box_plot"></div>').appendTo($("body"));
    }
    
    var chart = dc.boxPlot("#box_plot");
    //d3.csv("dc-js/morley_two_col.csv", function(error, experiments) {
        //console.log(experiments);

      experiments.forEach(function(x) {
        x.Speed = +x.Speed;
      });

      var ndx                 = crossfilter(experiments),
          //runDimension        = ndx.dimension(function(d) {return +d.Run;}),
          //runGroup            = runDimension.group(),
          experimentDimension = ndx.dimension(function(d) {return d.Expt;}),
          speedArrayGroup     = experimentDimension.group().reduce(
            function(p,v) {
              p.push(v.Speed);
              return p;
            },
            function(p,v) {
              p.splice(p.indexOf(v.Speed), 1);
              return p;
            },
            function() {
              return [];
            }
          );

    var _w = $("#preview_html").width()-50;
    //console.log([_w, _count*300]);
    if (_w > _count*300) {
        _w = _count*300;
    }
    

      chart
        .width(_w)
        .height(_w*0.6)
        .margins({top: 10, right: 50, bottom: 50, left: 50})
        .dimension(experimentDimension)
        .group(speedArrayGroup)
        .elasticY(true)
        .elasticX(true);

      dc.renderAll();
    /*
      var i=0;
      setInterval(function() {
        runDimension.filterAll();
        runDimension.filter([i++,21]);
        dc.renderAll();
      }, 2000);
    */
    //});
    
    return _box_plot;
};  // var _draw_box_plot = function (_variables) {

// --------------------------------------------

var _draw_descriptive_table = function (_variable) {
    var _table = $('<div class="analyze-result">'
        + '<div class="caption" style="text-align:center;display:block">樣本敘述統計量<sup>I</sup>：</div>'
        + '<table border="1" cellpadding="0" cellspacing="0">'
            + '<thead><tr>'
                + '<th>' + '分組變數 <br /> Grouping Vairable' + '</th>'
                + '<th>' + '樣本數 <br /> Count' + '</th>'
                + '<th>' + '平均數 <br /> Mean' + '</th>'
                + '<th>' + '中位數 <br /> Median' + '</th>'
                + '<th>' + '最小值 <br /> Minimum' + '</th>'
                + '<th>' + '最大值 <br /> Maximum' + '</th>'
                + '<th>' + '標準差 <br /> Std. dev.' + '</th>'
            + '</tr></thead>'
            + '<tbody></tbody>'
        + '</table>'
        + '<div>I: 樣本敘述統計量皆不包含遺失值</div>'
        + '</div>');
    
    var _tbody = _table.find('tbody');
    
    for (var _name in _variable) {
        var _values = _variable[_name];
        var _tr = $('<tr></tr>').appendTo(_tbody);
        
        $('<td>' + _name + '</td>').appendTo(_tr);
        
        $('<td align="right">' + _values.length + '</td>').appendTo(_tr);
        
        $('<td align="right">' + precision_string(_calc_avg(_values), 4) + '</td>').appendTo(_tr);
        
        $('<td align="right">' + _calc_median(_values) + '</td>').appendTo(_tr);
        
        $('<td align="right">' + _calc_minimum(_values) + '</td>').appendTo(_tr);
        
        $('<td align="right">' + _calc_maximum(_values) + '</td>').appendTo(_tr);
        
        $('<td align="right">' + precision_string(_calc_stdev(_values), 4) + '</td>').appendTo(_tr);
    }
    
    return _table;
};  // var _draw_descriptive_table = function (_variable) {


// --------------------------------------------

var _draw_f_test_table = function (_variable) {
    
    var _data = [];
    for (var _name in _variable) {
        _data.push(_variable[_name]);
    }
    
    if (_data[0].length < _data[1].length) {
        var _temp = _data[0];
        _data[0] = _data[1];
        _data[1] = _temp;
    }
    /*
    var _s1 = _calc_var(_data[0]);
    var _s2 = _calc_var(_data[1]);
    if (_s1 < _s2) {
        var _temp = _data[0];
        _data[0] = _data[1];
        _data[1] = _temp;
        console.log('交換');
    }
    */
    var _df_numerator = _data[0].length - 1;
    var _df_denominator = _data[1].length - 1;
    
    var _f_stat, _p_value, _lower, _upper;
    
        _f_stat = F_TEST.calc_f_stat(_data[0], _data[1]);
        _p_value = jStat.centralF.cdf(_f_stat, _df_numerator, _df_denominator)*2;

        _lower = F_TEST.calc_confidence_interval_lower(_data[0], _data[1]);
        _upper = F_TEST.calc_confidence_interval_upper(_data[0], _data[1]);
    
    //console.log();
    
    var is_equal = true;
    if (_p_value < 0.05) {
        is_equal = false;
    }
    
    var _table = $('<div class="analyze-result">'
        + '<div class="caption" style="text-align:center;display:block">雙樣本變異數(標準差)差異檢定：</div>'
        + '<table border="1" cellpadding="0" cellspacing="0" class="var_test" is_equal="' + is_equal + '">'
            + '<thead>'
                + '<tr><th colspan="6"><strong>虛無假設</strong>：兩組資料的變異數相等<br />H<sub>0</sub>: σ<sub>1</sub><sup>2</sup>/σ<sub>2</sub><sup>2</sup> = 1</th></tr>'
                + '<tr><th rowspan="2">' + 'F檢定統計量 <br /> F-statistics' + '</th>'
                + '<th rowspan="2">' + '分子自由度 <br /> d.f. of numerator' + '</th>'
                + '<th rowspan="2">' + '分母自由度 <br /> d.f. of denominator' + '</th>'
                + '<th rowspan="2">' + 'p-值<sup>I</sup> <br /> p-value' + '</th>'
                + '<th colspan="2">' + '母體變異數比值的95%信賴區間 <br /> 95% C.I. for ratio' + '</th></tr>'
                + '<tr>'
                + '<th>' + '下界 <br /> Lower' + '</th>'
                + '<th>' + '上界 <br /> Upper' + '</th>'
            + '</tr></thead>'
            + '<tbody><tr>'
                + '<td align="right" class="f_stat">' + precision_string(_f_stat, 4) + '</td>'
                + '<td align="right">' + _df_numerator + '</td>'
                + '<td align="right">' + _df_denominator + '</td>'
                + '<td align="right" class="p_value">' + precision_string(_p_value, 4) + '</td>'
                + '<td align="right">' + precision_string(_lower, 4) + '</td>'
                + '<td align="right">' + precision_string(_upper, 4) + '</td>'
            + '</tr></tbody>'
        + '</table>'
        + '<div>I: 顯著性代碼： \'***\': < 0.001, \'**\': < 0.01, \'*\': < 0.05, \'#\': < 0.1 </div>'
        + '</div>');

    return  _table;
};

var _draw_levene_test_table = function (_variable) {
    // https://jstat.github.io/all.html#jStat.centralF.pdf
    
    var _data = [];
    for (var _name in _variable) {
        _data.push(_variable[_name]);
    }
    
    if (_data[0].length < _data[1].length) {
        var _temp = _data[0];
        _data[0] = _data[1];
        _data[1] = _temp;
    }
    
    var _f_stat, _p_value, _crit = 0;
    _f_stat = LEVENE_TEST.calc_levene_test(_variable);
    var k = LEVENE_TEST.calc_k(_data);
    var N = LEVENE_TEST.calc_N(_variable);

    _crit = LEVENE_TEST.calc_critical_value(k, N, 0.05);

    //_p_value = jStat.centralF.pdf(_f_stat, k-1, N-k )*2;
    _p_value = LEVENE_TEST.calc_p_value(k, N, _f_stat);
    
    var is_equal = true;
    if (_p_value < 0.05) {
        is_equal = false;
    }
    
        var _table = $('<div class="analyze-result">'
        + '<div class="caption" style="text-align:center;display:block">(獨立)多樣本變異數(標準差)差異檢定：</div>'
        + '<table border="1" cellpadding="0" cellspacing="0" class="var_test" is_equal="' + is_equal + '">'
            + '<thead>'
                + '<tr><th colspan="5"><strong>虛無假設</strong>：兩組資料的變異數相等<br />H<sub>0</sub>: σ<sub>1</sub><sup>2</sup> = σ<sub>2</sub><sup>2</sup></th></tr>'
                + '<tr><th>' + 'F檢定統計量 <br /> F-statistics' + '</th>'
                + '<th>' + '分子自由度 <br /> d.f. of numerator' + '</th>'
                + '<th>' + '分母自由度 <br /> d.f. of denominator' + '</th>'
                + '<th>' + '臨界值 <br /> F(d.f.1, d.f.2, 1-α)' + '</th>'
                + '<th>' + 'p-值<sup>I</sup> <br /> p-value' + '</th>'
            + '</tr></thead>'
            + '<tbody><tr>'
                + '<td align="right" class="f_stat">' + precision_string(_f_stat, 4) + '</td>'
                + '<td align="right">' + (k-1) + '</td>'
                + '<td align="right">' + (N-k) + '</td>'
                + '<td align="right">' + precision_string(_crit, 4) + '</td>'
                + '<td class="p_value">' + precision_string(_p_value, 4) + '</td>'
            + '</tr></tbody>'
        + '</table>'
        + '<div>I: 顯著性代碼： \'***\': < 0.001, \'**\': < 0.01, \'*\': < 0.05, \'#\': < 0.1 </div>'
        + '</div>');

    return  _table;
};

// ----------------------------------------

var _draw_t_test_table = function (_variable, _is_equal) {
    
    var _data = [];
    for (var _i in _variable) {
        _data.push(_variable[_i]);
    }
    //console.log(_data);
    
    var _n1 = _data[0].length;
    var _n2 = _data[1].length;
    var _x1 = _calc_avg(_data[0]);
    var _x2 = _calc_avg(_data[1]);
    var _u = (_calc_sum(_data[0]) + _calc_sum(_data[1])) / (_n1+_n2);
    
    //console.log(JSON.stringify({
    //    u: _u,
    //    'x1-x2': (_x1 - _x2)
    //}));
    
    // 接下來算sw2
    var _df1 = _n1 - 1;
    var _df2 = _n2 - 1;
    var _s1 = _calc_var(_data[0]);
    var _s2 = _calc_var(_data[1]);
    var _sw2 = ( (_df1 * _s1) + (_df2 * _s2) ) / (_df1 + _df2);
    
    // --------------------------------------
    
    var _t_stat = 0;
    if (_is_equal === true) {
        _t_stat = ( _x1 - _x2 ) / Math.sqrt( _sw2 * ( (1/_n1) + (1/_n2)  )  );
    }
    else {
        _t_stat = (_x1 - _x2) / Math.sqrt( (_s1/_n1) + (_s2/_n2) );
    }
    //_t_stat = Math.abs(_t_stat);
    
    var _df = _df1 + _df2;
    
    //var _crit = tprob(_df, _t_stat);
    var _alpha = 0.05;
    
    var _crit = tdistr(_df, (1- (_alpha/2) ) );
    _crit = Math.abs(_crit);
    
    // https://jstat.github.io/all.html#jStat.studentt
    var _p_value = tprob(_df, Math.abs(_t_stat))*2;
    //console.log([_df, _t_stat, tprob(_df, _t_stat)*2, _p_value]);
    
    var _diff = Math.abs(_x1 - _x2);
    
    var _is_sig = false;
    if (_p_value < 0.05) {
        _is_sig = true;
    }
    
    // ----------------------------------
    // http://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm
    /*
    
    var _n = _combine_data.length;
    var _t_stat_ci = tdistr((_n-1), (1-(_alpha/2)));
    var _combine_stddev = _calc_stdev(_combine_data);
    var _combine_mean = _calc_avg(_combine_data);
    
    console.log(_combine_stddev);
    
    
    var _interval = _t_stat_ci * _combine_stddev / Math.sqrt(_n);
    _interval = Math.abs(_interval);
    var _lower = _combine_mean - _interval;
    var _upper = _combine_mean + _interval;
    */
   
    // http://www.sample-size.net/confidence-interval-mean/
    /*
    var _combine_data = _data[0].concat(_data[1]);
    var _combine_stddev = _calc_stdev(_combine_data);
    var _n = _combine_data.length;
    var _tcl = tdistr(_n-1, (_alpha/2) );
    var _sem = _combine_stddev / Math.sqrt(_n);
    console.log({
        1: _combine_data,
        2: _combine_stddev,
        3: _n,
        4: _tcl,
        5: _sem
    });
    //var _mse = (_s1 + _s2) / 2;
    var _lower = _u - (_tcl * _sem); 
    var _upper = _u + (_tcl * _sem);
    */
    //var _sm1m2 = Math.sqrt( (2*_mse) /  )
    
    // http://www.statisticslectures.com/topics/ciindependentsamplest/
    var _combine_data = _data[0].concat(_data[1]);
    var _ci_df = _df;
    var _sp2 = (( _df1 * _s1 ) +  ( _df2 * _s2 )) / _df;
    var _sp = Math.sqrt(_sp2);
    var _ci_s = _calc_stdev(_combine_data);
    /*
    if (_df2 < _ci_df) {
        _ci_df = _df2;
    }
    */
    
    /*
    var _x1 = 266.2;
    var _x2 = 219.7778;
    var _s1 = 19.5095*19.5095;
    var _s2 = 30.3677*30.3677;
    var _n1 = 10;
    var _n2 = 9;
    var _ci_df = 8;
    var _diff = _x1 - _x2;
    */
    
    var _t_stat_ci = tdistr(_ci_df, (_alpha/2));
    var _interval = _t_stat_ci * _sp * Math.sqrt( (1/_n1) + (1 / _n2) );
    _interval = Math.abs(_interval);
    var _lower = _diff - _interval;
    var _upper = _diff + _interval;
    
    /*
    console.log({
        df: _ci_df,
        x1: _x1,
        x2: _x2,
        tci: _t_stat_ci,
        s1: _s1,
        n1: _n1,
        s1n1: (_s1/_n1),
        s2: _s2,
        n2: _n2,
        s2n2: (_s2/_n2),
        int: _interval
    });
    */
    // ----------------------------------------
    
    var _note1 = "根據雙樣本變異數檢定結果，假設兩母體具有相同變異數進行雙樣本平均數差異t檢定。";
    if (_is_equal === false) {
        _note1 = "根據雙樣本變異數檢定結果，假設兩母體具有不同變異數進行雙樣本平均數差異t檢定。";
    }
    
    var _table = $('<div class="analyze-result">'
        + '<div class="caption" style="text-align:center;display:block">雙樣本平均數差異t檢定(獨立樣本)<sup>I</sup>：</div>'
        + '<table border="1" cellpadding="0" cellspacing="0" class="t-test" is_sig="' + _is_sig + '">'
            + '<thead>'
                + '<tr><th colspan="7">'
                    + '<strong>虛無假設</strong>：' 
                    + '母體平均數差異 = 0<br />'
                    + 'H<sub>0</sub>: μ<sub>1</sub> - μ<sub>2</sub> = 0</th></tr>'
                + '<tr><th rowspan="2">' + 't檢定統計量 <br /> t-statistics' + '</th>'
                + '<th rowspan="2">' + '自由度 <br /> d.f.' + '</th>'
                + '<th rowspan="2">' + '臨界值 <br /> t(d.f., 1-α/2)' + '</th>'
                + '<th rowspan="2">' + 'p-值<sup>II</sup> <br /> p-value' + '</th>'
                + '<th rowspan="2">' + '樣本平均數與母體平均數的差異 <br /> Difference between sample and null means' + '</th>'
                + '<th colspan="2">' + '母體變異數比值的95%信賴區間 <br /> 95% C.I. for difference' + '</th></tr>'
                + '<tr>'
                + '<th>' + '下界 <br /> Lower' + '</th>'
                + '<th>' + '上界 <br /> Upper' + '</th>'
            + '</tr></thead>'
            + '<tbody><tr>'
                + '<td align="right" class="t_stat">' + precision_string(_t_stat, 4) + '</td>'
                + '<td align="right">' + _df + '</td>'
                + '<td align="right">' + precision_string(_crit, 4) + '</td>'
                + '<td align="right" class="p_value">' + precision_string(_p_value, 4) + '</td>'
                + '<td align="right">' + precision_string(_diff, 4) + '</td>'
                + '<td align="right">' + precision_string(_lower, 4) + '</td>'
                + '<td align="right">' + precision_string(_upper, 4) + '</td>'
            + '</tr></tbody>'
        + '</table>'
        + '<div>I: ' + _note1 + ' <br />'
        + 'II: 顯著性代碼： \'***\': < 0.001, \'**\': < 0.01, \'*\': < 0.05, \'#\': < 0.1 </div>'
        + '</div>');

    return  _table;
};

// ----------------------------------------

var _build_conclusion = function (_variables, _descriptive_table, _var_test_table, _t_test_table) {
    var _conclusion = $('<div>'
        + '<span class="speak" alt="獨立樣本t檢定分析結果顯示。">獨立樣本t檢定分析結果：</span>'
        + '<ul></ul></div>');
    var _ul = _conclusion.find('ul');
    
    var _attr_list = [];
    for (var _attr in _variables) {
        _attr_list.push(_attr);
    }
    
    $('<li>' + '<span class="speak">本研究</span>使用獨立樣本t檢定來<span class="speak">比較' 
            + _attr_list[0] + '與' + _attr_list[1]
            + '的平均數是否有所差異。</span>'
            + '</li>').appendTo(_ul);
    
    // -----------------------------
    
    var _n1 = _variables[_attr_list[0]].length;
    var _x1 = _calc_avg(_variables[_attr_list[0]]);
    _x1 = Math.round(_x1 * 1000)/1000;
    var _n2 = _variables[_attr_list[1]].length;
    var _x2 = _calc_avg(_variables[_attr_list[1]]);
    _x2 = Math.round(_x2 * 1000)/1000;
    
    $('<li class="speak">' + _attr_list[0] + '抽樣' + _n1 + '個，平均數為' + _x1 + '；'
            + _attr_list[1] + '抽樣' + _n2 + '個，平均數為' + _x2 + '。'
            + '</li>').appendTo(_ul);
    
    // -----------------------------
    
    var _f_stat = _var_test_table.find('.f_stat').text();
    var _var_test_p_value = _var_test_table.find('.p_value').text();
    var _is_equal = _var_test_table.find(".var_test:first").attr("is_equal");
    _is_equal = (_is_equal === "true");
    
    var _f_con = '在變異數同質性檢定中，檢定統計量f值為' + _f_stat + '，'
        + '機率值p值為' + _var_test_p_value;
    if (_is_equal === true) {
        _f_con += '，未達α=0.05的顯著水準，'
            + '表示兩組樣本的變異數並無顯著差異，因此獨立樣本t檢定採用變異數相同的檢定統計量t值計算方式。'
    }
    else {
        _f_con += '，達到α=0.05的顯著水準，'
            + '表示兩組樣本的變異數存在顯著差異，因此獨立樣本t檢定採用變異數不相同的檢定統計量t值計算方式。'
    }
    
    $('<li>' + _f_con + '</li>').appendTo(_ul);
    
    // --------------------------------------
    var _t_stat = _t_test_table.find('.t_stat').text();
    var _t_test_p_value = _t_test_table.find('.p_value').text();
    var _is_sig = _t_test_table.find('.t-test:first').attr("is_sig");
    _is_sig = (_is_sig === "true");
    
    var _t_con = '在獨立樣本t檢定中，<span class="speak">檢定統計量t值為' + _t_stat + '，'
        + '機率值p值為' + _t_test_p_value + '，</span>';
    if (_is_sig === false) {
        _t_con += '未達α=0.05的顯著水準，因此無法拒絕虛無假設。';
    }
    else {
        _t_con += '達到α=0.05的顯著水準，因此拒絕虛無假設，接受對立假設。';
    }
    
    $('<li>' + _t_con + '</li>').appendTo(_ul);
    
    // -----------------------
    
    var _r_conf = '';
    if (_is_sig === false) {
        _r_conf = '表示' + _attr_list[0] + '與' + _attr_list[1] 
                + '兩組的平均數並沒有顯著差異。';
    }
    else {
        _r_conf = '表示' + _attr_list[0] + '與' + _attr_list[1] 
                + '兩組的平均數有顯著差異。其中';
        if (_x1 > _x2) {
            _r_conf += _attr_list[0] + '顯著大於' + _attr_list[1] + '。';
        }
        else {
            _r_conf += _attr_list[1] + '顯著大於' + _attr_list[0] + '。';
        }
    }
    
    _r_conf += '<span class="speak" alt="分析結束。"></span>';
    
    $('<li class="speak">' + _r_conf + '</li>').appendTo(_ul);
    
    return _conclusion;
};