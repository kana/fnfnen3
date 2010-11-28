describe('Core', function () {
  describe('learn', function () {
    it('should count tokens correctly', function () {
      var dict = {};

      prafbe.learn(dict, 'love me do');
      expect(dict['love']).toEqual(1);
      expect(dict['me']).toEqual(1);
      expect(dict['do']).toEqual(1);
      expect(dict['tender']).not.toBeDefined();

      prafbe.learn(dict, 'love me tender');
      expect(dict['love']).toEqual(2);
      expect(dict['me']).toEqual(2);
      expect(dict['do']).toEqual(1);
      expect(dict['tender']).toEqual(1);

      prafbe.learn(dict, 'love me love me tender');
      expect(dict['love']).toEqual(4);
      expect(dict['me']).toEqual(4);
      expect(dict['do']).toEqual(1);
      expect(dict['tender']).toEqual(2);
    });
  });
  describe('list_bigrams', function () {
    it('should list bigrams of a plain ascii string', function () {
      expect(prafbe.list_bigrams('abcde')).
      toEqual(['ab', 'bc', 'cd', 'de']);
    });
    it('should list bigrams of a multibyte string', function () {
      expect(prafbe.list_bigrams('あいうえお')).
      toEqual(['あい', 'いう', 'うえ', 'えお']);
    });
  });
  describe('tokenize', function () {
    var _ = function (s, tokens) {
      expect(prafbe.tokenize(s)).toEqual(tokens);
    };

    it('should split plain English words', function () {
      _('foo bar baz', ['foo', 'bar', 'baz']);
      _('  a  b  c  ', ['a', 'b', 'c']);
    });
    it('should split plain English words in a sentence', function () {
      _('It works.', ['It', 'works']);
    });
    it('should count some charcters as ordinary alphabets', function () {
      _('send more $', ['send', 'more', '$']);
      _('a-b-c d-e-f', ['a-b-c', 'd-e-f']);
      _('wow! really?', ['wow!', 'really']);
      _('you\'ll know', ['you\'ll', 'know']);
    });
    it('should ignore digit-only words', function () {
      _('Sum of 12 and 34 is 46.', ['Sum', 'of', 'and', 'is']);
      _('2dx gold', ['2dx', 'gold']);
    });
    it('should count domain-like part as a word', function () {
      _('127.0.0.1 = localhost', ['127.0.0.1', 'localhost']);
      _('did.you.know', ['did.you.know']);
    });
    it('should tokenize multibyte characters by 2-gram', function () {
      _('あいうえお', ['あい', 'いう', 'うえ', 'えお']);
      _('foo あいうえお bar', ['foo', 'あい', 'いう', 'うえ', 'えお', 'bar']);
    });
  });
});




// __END__
// vim: expandtab shiftwidth=2 softtabstop=2
// vim: foldmethod=expr
// vim: foldexpr=getline(v\:lnum)=~#'\\v(<describe>|<it>).*<function>\\s*\\([^()]*\\)\\s*\\{'?'a1'\:(getline(v\:lnum)=~#'^\\s*});'?'s1'\:'=')
