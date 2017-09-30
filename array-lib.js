
var uniqle_array = function(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
};

var is_array = function(_a) {
    return ( Object.prototype.toString.call( _a ) === '[object Array]' );
};

var get_json_keys = function (_json) {
    var _keys = [];
    for (var _i in _json) {
        _keys.push(_i);
    }
    return _keys;
};

var json_to_array = function (_json) {
    var _result = [];
    for (var _i in _json) {
        _result.push(_json[_i]);
    }
    return _result;
};