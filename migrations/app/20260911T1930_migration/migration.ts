#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/194dde14bd64363e29f891063d15a0de38400cc089128d90baecb1a25cfbf4a3/contract';
import startContract from '../../snapshots/194dde14bd64363e29f891063d15a0de38400cc089128d90baecb1a25cfbf4a3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/d7739665fb6b2960294e06c8f93e4ed269ca7a5c56bfc97d6c8d5a0e91c0a9b8/contract';
import endContract from '../../snapshots/d7739665fb6b2960294e06c8f93e4ed269ca7a5c56bfc97d6c8d5a0e91c0a9b8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('avatarUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
