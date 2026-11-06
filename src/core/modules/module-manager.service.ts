import { Injectable } from '@nestjs/common';
import { ModuleManifest, ModuleStatus } from '../../contracts/module-manifest';
import { ModuleStateService } from './module-state.service';
import { ModuleRegistryService } from './module-registry.service';
import {
  ModuleHasActiveDependentsException,
  RequiredDependenciesDisabledException,
} from '../../common/exceptions/module.exception';

export interface ModuleView {
  manifest: ModuleManifest;
  status: ModuleStatus;
  dependents: string[];
}

@Injectable()
export class ModuleManagerService {
  constructor(
    private readonly state: ModuleStateService,
    private readonly registry: ModuleRegistryService,
  ) {}

  async enable(moduleId: string, actor: string): Promise<void> {
    const manifest = this.registry.getOrThrow(moduleId);

    await this.state.transition(
      moduleId,
      'ENABLED',
      (states) => {
        const missing = manifest.dependencies.required.filter(
          (dep) => states.get(dep) !== 'ENABLED',
        );
        if (missing.length)
          throw new RequiredDependenciesDisabledException(moduleId, missing);
      },
      actor,
    );
  }

  async disable(moduleId: string, actor: string): Promise<void> {
    this.registry.getOrThrow(moduleId);

    await this.state.transition(
      moduleId,
      'DISABLED',
      (states) => {
        const blockers = this.registry
          .dependentsOf(moduleId)
          .filter((m) => states.get(m.id) === 'ENABLED')
          .map((m) => m.id);
        if (blockers.length)
          throw new ModuleHasActiveDependentsException(moduleId, blockers);
      },
      actor,
    );
  }

  async list(): Promise<ModuleView[]> {
    const states = await this.state.snapshot();
    return this.registry.list().map((manifest) => ({
      manifest,
      status: states.get(manifest.id) ?? 'DISABLED',
      dependents: this.registry.dependentsOf(manifest.id).map((m) => m.id),
    }));
  }
}
