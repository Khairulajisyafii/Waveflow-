#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/194dde14bd64363e29f891063d15a0de38400cc089128d90baecb1a25cfbf4a3/contract';
import endContract from '../../snapshots/194dde14bd64363e29f891063d15a0de38400cc089128d90baecb1a25cfbf4a3/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/2e3ce95572122f9a755a5a4e0b98570836ae92113e67de19f87b07b35b0b3ca5/contract';
import startContract from '../../snapshots/2e3ce95572122f9a755a5a4e0b98570836ae92113e67de19f87b07b35b0b3ca5/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'project',
        column: col('ciStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'project',
        column: col('githubRepo', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
