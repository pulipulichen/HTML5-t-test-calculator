
var _calc_sum = function (_ary) {
    var _sum = 0;
    for (var _i = 0; _i < _ary.length; _i++) {
        _sum += _ary[_i];
    }
    return (_sum);
};

var _calc_avg = function (_ary) {
    if (_ary.length === 0) {
        return;
    }
    var _sum = 0;
    for (var _i = 0; _i < _ary.length; _i++) {
        _sum += _ary[_i];
    }
    return (_sum / _ary.length);
};

var _calc_stdev = function (_ary) {
    if (_ary.length === 0) {
        return;
    }
    var _avg = _calc_avg(_ary);
    var _var = 0;
    
    for (var _i = 0; _i < _ary.length; _i++) {
        var _a = (_ary[_i] - _avg);
        _var += _a*_a;
    }
    return Math.sqrt(_var / (_ary.length-1));
};

var _calc_var = function (_ary) {
    if (_ary.length === 0) {
        return;
    }
    var _avg = _calc_avg(_ary);
    var _var = 0;
    
    for (var _i = 0; _i < _ary.length; _i++) {
        var _a = (_ary[_i] - _avg);
        _var += _a*_a;
    }
    return (_var / (_ary.length-1));
};

var _calc_minimum = function (_ary) {
    if (_ary.length === 0) {
        return;
    }
    var _result = _ary[0];
    for (var _i = 1; _i < _ary.length; _i++) {
        if (_ary[_i] < _result) {
            _result = _ary[_i];
        }
    }
    return _result;
};

var _calc_median = function (values) {

    values.sort( function(a,b) {return a - b;} );

    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (values[half-1] + values[half]) / 2.0;
};

var _calc_maximum = function (_ary) {
    if (_ary.length === 0) {
        return;
    }
    var _result = _ary[0];
    for (var _i = 1; _i < _ary.length; _i++) {
        if (_ary[_i] > _result) {
            _result = _ary[_i];
        }
    }
    return _result;
};
