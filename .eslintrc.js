module.exports = {
  extends: 'airbnb-base',
  rules: {
    'linebreak-style': ['error', 'windows'],
    'no-await-in-loop': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-restricted-syntax': 'off',
    'operator-linebreak': 'off',
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    'arrow-parens': 'off',
    'object-curly-newline': ['error', { multiline: true, minProperties: 5 }],
    'import/named': 'off'
  }
};
