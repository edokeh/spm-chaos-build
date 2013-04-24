#!/usr/bin/env node

try {
  require('spm').plugin.uninstall('chaos-build');
} catch(e) {}
