var prafbe = {};




prafbe.list_bigrams = function (s)
{
  var bigrams = [];

  for (var i = 1; i < s.length; i++)
    bigrams.push(s[i - 1] + s[i]);

  return bigrams;
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
