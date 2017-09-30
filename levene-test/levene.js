// Levene's Test
// Luke Mitchell, April 2016
// https://github.com/lukem512/levene-test

//var sm = require('statistical-methods');

var LEVENE_TEST = {};

LEVENE_TEST.abs = function(mu, s) {
	return Math.abs(mu - s);
};

LEVENE_TEST.quad = function(mu, s) {
	var delta = (mu - s);
	return delta * delta;
};

// Perform the Levene transformation.
LEVENE_TEST.transform = function(samples, quadratic) {
    var z = [];

    var modifier = (quadratic) ? LEVENE_TEST.quad : LEVENE_TEST.abs;

    samples.forEach(function(sample) {
            var mu = _calc_avg(sample);
            var zj = [];
            sample.forEach(function(s) {
                    zj.push(modifier(mu, s));
            });
            z.push(zj);
    });

    return z;
};

LEVENE_TEST.calc_k = function (samples) {
    return samples.length;
};

LEVENE_TEST.calc_N = function (samples) {
    if (is_array(samples) === false) {
        samples = json_to_array(samples);
    }
    
    var N = 0;
    samples.forEach(function(sample) {
            N += sample.length;
    });
    return N;
};

/**
 * Compute the W-value
 * @param {type} samples
 * @param {type} quadratic
 * @returns {Number}
 */
LEVENE_TEST.calc_levene_test = function(samples, quadratic) {
    if (is_array(samples) === false) {
        samples = json_to_array(samples);
    }
    
    var z = LEVENE_TEST.transform(samples, quadratic);

    // Compute N, the total number of observations
    // and p, the number of samples
    var p = samples.length;
    var N = LEVENE_TEST.calc_N(samples);
    

    // Compute z.., the mean of all zij
    var zs = [];
    z.forEach(function(zi) {
            zs = zs.concat(zi);
    });
    var zdotdot = _calc_avg(zs);

    // Compute the denominator and the numerator
    var numerator = 0, denominator = 0;
    for (var i = 0; i < p; i++) {

            // The number of observations in sample i
            var n = samples[i].length;

            // The mean of all zij for sample i
            var zidot = _calc_avg(z[i]);

            var dz = (zidot - zdotdot);
            numerator += (n * (dz * dz));

            denominator += _calc_sum(z[i].map(function(zij) {
                    var dz = (zij - zidot);
                    return (dz * dz);
            }));
    }

    // Add divisors
    numerator = (N - p) * numerator;
    denominator = (p - 1) * denominator;

    var _f_stat = (numerator / denominator);
    
    // Return ratio
    return _f_stat; 
};

LEVENE_TEST.calc_critical_value = function (k, N, _alpha) {
    // http://www.itl.nist.gov/div898/handbook/eda/section3/eda35a.htm
    return jStat.centralF.inv(1-_alpha , (k-1),(N-k));
};

LEVENE_TEST.calc_p_value = function (k, N, _f_stat) {
    return fprob(k-1, N-k, _f_stat);
};