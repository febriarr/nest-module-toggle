export type ModuleStatus = 'ENABLED' | 'DISABLED';

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  defaultEnabled: boolean;
  dependencies: {
    required: string[];
    optional: string[];
  };
  capabilities: {
    provides: string[];
    requires: string[];
  };
}
