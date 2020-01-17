/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { PrePackagedRules } from '../types';
import { RuleAlertType } from './types';

export const getRulesToInstall = (
  rulesFromFileSystem: PrePackagedRules[],
  installedRules: RuleAlertType[]
): PrePackagedRules[] => {
  return rulesFromFileSystem.filter(
    rule => !installedRules.some(installedRule => installedRule.params.ruleId === rule.rule_id)
  );
};
