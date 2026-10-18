export default {
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  rules: {
    'at-rule-no-unknown': [true, { ignoreAtRules: ['value'] }],
    'declaration-block-single-line-max-declarations': null,
    'import-notation': null,
    'media-feature-range-notation': null,
    'media-feature-name-value-no-unknown': [
      true,
      { ignoreMediaFeatureNameValues: { width: /^(compact|wide)$/ } },
    ],
    'no-descending-specificity': null,
    'no-duplicate-selectors': null,
    'property-no-vendor-prefix': null,
    'rule-empty-line-before': null,
    'selector-class-pattern': null,
    'value-keyword-case': null,
  },
}
