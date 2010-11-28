describe('Core', function () {
  describe('calculate_spamness', function () {
    it('should calculate special value for unfamiliar token', function () {
      expect(prafbe.calculate_spamness({}, {}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);

      expect(prafbe.calculate_spamness({'foo': 1}, {}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({'foo': 2}, {}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({'foo': 3}, {}, 'foo')).
      not.toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);

      expect(prafbe.calculate_spamness({}, {'foo': 1}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({}, {'foo': 4}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({}, {'foo': 5}, 'foo')).
      not.toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);

      expect(prafbe.calculate_spamness({'foo': 1}, {'foo': 2}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({'foo': 1}, {'foo': 3}, 'foo')).
      not.toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
    });
    it('should calculate max value for token only in wrong dict', function () {
      expect(prafbe.calculate_spamness({}, {'foo': 4}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({}, {'foo': 5}, 'foo')).
      toEqual(1 - 2 * prafbe.MINIMUM_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({}, {'foo': 10}, 'foo')).
      toEqual(1 - 2 * prafbe.MINIMUM_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({}, {'foo': 11}, 'foo')).
      toEqual(1 - prafbe.MINIMUM_TOKEN_PROBABILITY);
    });
    it('should calculate min value for token only in right dict', function () {
      expect(prafbe.calculate_spamness({'foo': 2}, {}, 'foo')).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({'foo': 3}, {}, 'foo')).
      toEqual(2 * prafbe.MINIMUM_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({'foo': 10}, {}, 'foo')).
      toEqual(2 * prafbe.MINIMUM_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness({'foo': 11}, {}, 'foo')).
      toEqual(prafbe.MINIMUM_TOKEN_PROBABILITY);
    });
    it('should calculate complex value for well-learned token', function () {
      expect(prafbe.calculate_spamness(
          {'a': 1, 'b': 9},
          {'a': 2, 'b': 8},
          'a'
      )).
      toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(prafbe.calculate_spamness(
          {'a': 1, 'b': 9},
          {'a': 3, 'b': 8},
          'a'
      )).
      not.toEqual(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
    });
    it('should calculate big value for spammy token', function () {
      var v_small = prafbe.calculate_spamness(
        {'a': 1, 'b': 9},
        {'a': 7, 'b': 8},
        'a'
      );
      var v_many = prafbe.calculate_spamness(
        {'a': 1, 'b': 9},
        {'a': 999, 'b': 8},
        'a'
      );
      expect(v_small).toBeGreaterThan(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(v_many).toBeGreaterThan(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(v_many).toBeGreaterThan(v_small);
    });
    it('should calculate small value for non-spammy token', function () {
      var v_small = prafbe.calculate_spamness(
        {'a': 7, 'b': 8},
        {'a': 3, 'b': 7},
        'a'
      );
      var v_many = prafbe.calculate_spamness(
        {'a': 999, 'b': 8},
        {'a': 3, 'b': 7},
        'a'
      );
      expect(v_small).toBeLessThan(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(v_many).toBeLessThan(prafbe.UNFAMILIAR_TOKEN_PROBABILITY);
      expect(v_many).toBeLessThan(v_small);
    });
  });
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
  describe('sum_token_counts', function () {
    it('should sum correctly', function () {
      expect(prafbe.sum_token_counts({})).toEqual(0);
      expect(prafbe.sum_token_counts({'a': 1})).toEqual(1);
      expect(prafbe.sum_token_counts({'a': 1, 'b': 2})).toEqual(3);
      expect(prafbe.sum_token_counts({'a': 1, 'b': 2, 'c': 3})).toEqual(6);
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
