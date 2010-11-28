var prafbe = {};

prafbe.MINIMUM_TOKEN_PROBABILITY = 0.0001;
prafbe.TOKEN_COUNT_KEY = '*token-count*';  // must contain non-token character.
prafbe.UNFAMILIAR_TOKEN_PROBABILITY = 0.4;




prafbe.calculate_spam_probability = function (probabilities)
{
  var p1 = probabilities.
           reduce(function (a, b) {return a * b;});
  var p2 = probabilities.
           map(function (x) {return 1 - x;}).
           reduce(function (a, b) {return a * b;});
  return p1 / (p1 + p2);
};




prafbe.calculate_spamness = function (right_dict, wrong_dict, token)
{
  var r = right_dict[token] || 0;
  var w = wrong_dict[token] || 0;
  var rn = prafbe.sum_token_counts(right_dict);
  var wn = prafbe.sum_token_counts(wrong_dict);
  var rp = Math.min(1, (2 * r) / rn);
  var wp = Math.min(1, w / wn);
  var mp = prafbe.MINIMUM_TOKEN_PROBABILITY;

  if (2 * r + w < 5) {
    return prafbe.UNFAMILIAR_TOKEN_PROBABILITY;
  } else if (r == 0) {
    return w <= 10 ? (1 - 2 * mp) : (1 - mp);
  } else if (w == 0) {
    return r <= 10 ? mp * 2 : mp;
  } else {
    return Math.max(0.01, Math.min(0.99, wp / (rp + wp)));
  }
};




prafbe.learn = function (dict, s)
{
  var tokens = prafbe.tokenize(s);
  for (var i in tokens) {
    var t = tokens[i];
    var n = dict[t];
    dict[t] = (n || 0) + 1;
  }

  dict[prafbe.TOKEN_COUNT_KEY] = null;
};




prafbe.list_bigrams = function (s)
{
  var bigrams = [];

  for (var i = 1; i < s.length; i++)
    bigrams.push(s[i - 1] + s[i]);

  return bigrams;
};




prafbe.list_most_interesting_tokens =
function (right_dict, wrong_dict, tokens, n, with_probability_p)
{
  with_probability_p = (with_probability_p || false);

  var pairs = [];
  for (var i in tokens) {
    var t = tokens[i];
    var p = Math.abs(
      0.5 - prafbe.calculate_spamness(right_dict, wrong_dict, t)
    );
    pairs.push([t, p]);
  }

  var most_interesting_pairs = (
    pairs
    .sort(function (a, b) {
      return b[1] <= a[1] ? -1 : 1;
    })
    .slice(0, n)
  );
  return (
    with_probability_p
    ? most_interesting_pairs
    : most_interesting_pairs.map(function (x) {return x[0];})
  );
};




prafbe.sum_token_counts = function (dict)
{
  var n = dict[prafbe.TOKEN_COUNT_KEY];

  if (n == null) {
    n = 0;
    for (var i in dict)
      n += dict[i];
    dict[prafbe.TOKEN_COUNT_KEY] = n;
  }

  return n;
};




prafbe.tokenize = function (s)
{
  return (
    s
    .replace(/([\u0000-\u007F]+)|([^\u0000-\u007F]+)/g, function (_, p1, p2) {
      if (p1) {
        return p1.replace(/[^A-Za-z0-9.\-$!']+/g, ' ')
      } else {
        return ' ' + prafbe.list_bigrams(p2).join(' ') + ' ';
      }
    })
    .split(/\s+/)
    .map(function (x) {return x.replace(/^\.+/, '');})
    .map(function (x) {return x.replace(/\.+$/, '');})
    .filter(function (x) {return x != '';})
    .filter(function (x) {return !(/^\d+$/.test(x));})
  );
};




// __END__
// vim: expandtab shiftwidth=2 softtabstop=2
// vim: foldmethod=marker
