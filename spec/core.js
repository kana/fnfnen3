describe('Core', function () {
  describe('calculate_spam_probability', function () {
    it('should calculate properly', function () {
      expect(prafbe.calculate_spam_probability([0.1, 0.2, 0.3])).
      toEqual(0.1*0.2*0.3 / (0.1*0.2*0.3 + (1-0.1)*(1-0.2)*(1-0.3)));
    });
  });
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
    it('should work on edge case: single character', function () {
      expect(prafbe.list_bigrams('a')).toEqual(['a']);
      expect(prafbe.list_bigrams('あ')).toEqual(['あ']);
    });
    xit('should work on edge case: null string', function () {
      expect(prafbe.list_bigrams('')).toEqual([]);  // ?
      expect(prafbe.list_bigrams('')).toEqual(['']);  // ?
    });
  });
  describe('list_most_interesting_tokens', function () {
    it('should list most interesting tokens', function () {
      var rd = {
        'a': 3, 'b': 4, 'c': 4, 'd': 5, 'e': 4,
        'f': 4, 'g': 5, 'h': 6, 'i': 7, 'j': 5,
        'k': 4, 'l': 5, 'm': 5, 'n': 6, 'o': 4,
        'p': 5, 'q': 6, 'r': 6, 's': 6, 't': 4,
        'u': 4, 'v': 5, 'w': 4, 'x': 4, 'y': 3,
        'z': 4
      };
      var wd = {
        'a': 4, 'b': 7, 'c': 4, 'd': 3, 'e': 4,
        'f': 5, 'g': 9, 'h': 5, 'i': 4, 'j': 5,
        'k': 4, 'l': 7, 'm': 4, 'n': 3, 'o': 4,
        'p': 5, 'q': 9, 'r': 5, 's': 4, 't': 5,
        'u': 4, 'v': 7, 'w': 4, 'x': 3, 'y': 4,
        'z': 5
      };
      var tokens = [
        'a', 'b', 'c', 'd', 'e',
        'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o',
        'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y',
        'z'
      ];

      expect(prafbe.list_most_interesting_tokens(rd, wd, tokens, 3)).
      toEqual(['n', 'i', 'd']);
      expect(prafbe.list_most_interesting_tokens(rd, wd, tokens, 5)).
      toEqual(['n', 'i', 'd', 's', 'x']);
    });
    it('can list tokens with probabilities', function () {
      var xs = prafbe.list_most_interesting_tokens(
        {},
        {},
        ['a', 'b', 'c'],
        15,
        true
      );
      
      expect(typeof xs[0][0]).toEqual(typeof '');
      expect(typeof xs[0][1]).toEqual(typeof 0);
    });
    it('should list distinct tokens', function () {
      var rd = {'a': 999, 'b': 888, 'c': 777, 'd': 0};
      var wd = {'a': 1, 'b': 1, 'c': 1, 'd': 1};
      var tokens = ['a', 'a', 'b', 'b', 'c', 'c', 'd'];

      expect(prafbe.list_most_interesting_tokens(rd, wd, tokens, 1)).
      toEqual(['a']);
      expect(prafbe.list_most_interesting_tokens(rd, wd, tokens, 3)).
      toEqual(['a', 'b', 'c']);
      expect(prafbe.list_most_interesting_tokens(rd, wd, tokens, 8)).
      toEqual(['a', 'b', 'c', 'd']);
    });
  });
  describe('sum_token_counts', function () {
    it('should sum correctly', function () {
      expect(prafbe.sum_token_counts({})).toEqual(0);
      expect(prafbe.sum_token_counts({'a': 1})).toEqual(1);
      expect(prafbe.sum_token_counts({'a': 1, 'b': 2})).toEqual(3);
      expect(prafbe.sum_token_counts({'a': 1, 'b': 2, 'c': 3})).toEqual(6);
    });
    it('should cache result', function () {
      var d = {};

      expect(prafbe.sum_token_counts(d)).toEqual(0);
      expect(d[prafbe.TOKEN_COUNT_KEY]).toEqual(0);

      d['a'] = 2;
      expect(prafbe.sum_token_counts(d)).toEqual(0);

      d[prafbe.TOKEN_COUNT_KEY] = 8;
      expect(prafbe.sum_token_counts(d)).toEqual(8);

      prafbe.learn(d, 'love me love me tender');
      expect(d[prafbe.TOKEN_COUNT_KEY]).toEqual(null);
      expect(prafbe.sum_token_counts(d)).toEqual(2 + 5);
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
    it('should work on edge case: single-character token', function () {
      _('f(x)(あ)', ['f', 'x', 'あ']);
    });
    it('should work on edge case: zero tokens', function () {
      _('', []);
      _('(>_<)', []);
    });
  });
  describe('unlearn', function () {
    it('should count tokens correctly', function () {
      var dict = {};

      prafbe.unlearn(dict, 'love me do');
      expect(dict['love']).toEqual(-1);
      expect(dict['me']).toEqual(-1);
      expect(dict['do']).toEqual(-1);
      expect(dict['tender']).not.toBeDefined();

      prafbe.unlearn(dict, 'love me tender');
      expect(dict['love']).toEqual(-2);
      expect(dict['me']).toEqual(-2);
      expect(dict['do']).toEqual(-1);
      expect(dict['tender']).toEqual(-1);

      prafbe.unlearn(dict, 'love me love me tender');
      expect(dict['love']).toEqual(-4);
      expect(dict['me']).toEqual(-4);
      expect(dict['do']).toEqual(-1);
      expect(dict['tender']).toEqual(-2);
    });
  });
});




// __END__
// vim: expandtab shiftwidth=2 softtabstop=2
// vim: foldmethod=expr
// vim: foldexpr=getline(v\:lnum)=~#'\\v<x?(describe|it)>.*<function>\\s*\\([^()]*\\)\\s*\\{'?'a1'\:(getline(v\:lnum)=~#'^\\s*});'?'s1'\:'=')
