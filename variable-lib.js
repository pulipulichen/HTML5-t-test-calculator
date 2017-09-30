
var _preprocess_group_variables = function (_csv) {
    return _preprocess_group_variables_multi_cols(_csv);
    /*
    var _result = {};
    
    // 先取得第一行，觀看第一行的個數
    var _is_multi_cols = (_csv.substr(0, _csv.indexOf("\n")).split(",").length > 2);
    if (_is_multi_cols === true) {
        return _preprocess_group_variables_multi_cols(_csv);
    }
    */
};

var _preprocess_group_variables_multi_cols = function (_csv) {
    // 每個欄位都是一個變項
    var _result = {};
    
    var _names = _csv.substr(0, _csv.indexOf("\n")).split(",");
    for (var _n = 0; _n < _names.length; _n++) {
        _names[_n] = _names[_n].trim();
        _result[_names[_n]] = [];
    }
    
    var _value_lines = _csv.split("\n");
    for (var _l = 1; _l < _value_lines.length; _l++) {
        var _values = _value_lines[_l].split(",");
        for (var _v = 0; _v < _values.length; _v++) {
            var _value = _values[_v].trim();
            if (_value === "") {
                continue;
            }
            
            if (isNaN(_value) === false) {
                _value = eval(_value);
            }
            _result[_names[_v]].push(_value);
        }
    }
    
    return _result;
};

var _preprocess_group_variables_by_group = function (_csv) {
    // 那一欄的資料比較多呢...?
    
    var _result = _preprocess_group_variables_multi_cols(_csv);
    // 計算每一種變項的種類數量
    var _result_type_count = {};
    var _min_count = undefined;
    var _min_name = "";
    var _min_types = [];
    for (var _name in _result) {
        var _array = JSON.parse(JSON.stringify(_result[_name]));
        uniqle_array(_array);
        
        if (_min_count === undefined 
                || _array.length < _min_count) {
            _min_count = _array.length;
            _min_name = _name;
            _min_types = _array;
        }
    }
    
    // 現在知道分組變數是_min_name了
    var _group_result = {};
    for (var _t = 0; _t < _min_types.length; _t++) {
        _group_result[_min_types[_t]] = [];
    }
    
    // 再來重新解釋_csv
    var _value_lines = _csv.split("\n");
    var _group_index = 0;
    var _value_index = 1;
    for (var _l = 0; _l < _value_lines.length; _l++) {
        var _values = _value_lines[_l].split(",");
        var _group_data = undefined;
        var _value_data = undefined;
        for (var _v = 0; _v < _values.length; _v++) {
            var _value = _values[_v].trim();
            if (_l === 0) {
                if (_value === _min_name) {
                    _group_index = _v;
                }
                else {
                    _value_index = _v;
                }
            }
            else {
                if (_v === _group_index) {
                    _group_data = _value;
                }
                else {
                    _value_data = _value;
                }
            }
            
            if (isNaN(_value_data) === false) {
                _value_data = eval(_value_data);
            }
            _result[_group_data].push(_value_data);
        }
    }
    
    
};

//-------------------------------------------------

var _draw_variables_list = function (_attr_list) {
    if (is_array(_attr_list) === false) {
        _attr_list = get_json_keys(_attr_list);
    }
    
    var _var_container = $("#variables_container");
    _var_container.empty();
    for (var _i = 0; _i < _attr_list.length; _i++) {
        var _attr = _attr_list[_i];
        var _div = $('<div class="field"><div class="ui checkbox">'
            + '<input type="checkbox" name="variables" value="' + _attr + '" id="variables_' + _i + '" checked="checked" /> '
            + '<label for="variables_' + _i + '">' 
                //+ '<i class="resize vertical icon"></i> '
                + '<i class="sort icon"></i>'
                //+ '<img src="drag_reorder1.png" />'
                + _attr 
                + '</label>'
            + '</div></div>');
        _div.appendTo(_var_container);
        _div.find('input').change(_draw_result_table);
        _div.bind('dragstop', _draw_result_table);
    }
    
    $( ".sortable" ).sortable({
        beforeStop: function () {
            //_draw_result_table();
        }
    });
    $( ".sortable" ).disableSelection();
};

var _set_variables_limit = function (_limit) {
    var _var_container = $("#variables_container");
    _var_container.attr("check_limit", _limit);
    
    var _indexes = [];
    for (var _i = 0; _i < _limit; _i++) {
        _indexes.push(_i);
    }
    _check_variables_list(_indexes);
    
    _var_container.find('input[type="checkbox"]').click(function () {
        var _input = $(this);
        var _checked = _input.prop("checked");
        
        var _var_container = _input.parents("#variables_container");
        var _limit = _var_container.attr("check_limit");
        var _checked_inputs = _var_container.find('input[type="checkbox"]:checked');
        
        if (_checked_inputs.length > _limit) {
            _input.addClass("current");
            _checked_inputs.filter(':not(.current):first').prop('checked', false);
            _input.removeClass("current");
        }
    });
};

var _check_variables_list = function (_indexes) {
    if (typeof(_indexes) === "number") {
        _indexes = [_indexes];
    }
    
    var _var_container = $("#variables_container");
    _var_container.find('input[type="checkbox"]').each(function (_i, _input) {
        var _checked = false;
        if ($.inArray(_i, _indexes) > -1) {
            _checked = true;
        }
        $(_input).prop("checked", _checked);
    });
};

var _get_checked_variables = function (_data) {
    var _result = {};
    
    var _var_container = $("#variables_container");
    _var_container.find('input[type="checkbox"]:checked').each(function (_i, _input) {
        var _value = _input.value;
        _result[_value] = _data[_value];
    });
    
    return _result;
};