#!/bin/sh

#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

i=0;
for f in ../rules/prepackaged_rules/*.json ; do
  ((i++));
  echo "converting $f"
  cat $f | tr -d '\n' | tr -d ' ' >> rules.ndjson
  echo "" >> rules.ndjson
done
