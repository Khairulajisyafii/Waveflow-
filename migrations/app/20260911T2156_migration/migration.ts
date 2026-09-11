#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/194dde14bd64363e29f891063d15a0de38400cc089128d90baecb1a25cfbf4a3/contract';
import startContract from '../../snapshots/194dde14bd64363e29f891063d15a0de38400cc089128d90baecb1a25cfbf4a3/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/bcf83432ae3ff8e4f022329c860c98fd8237153797d52b97b54632e3b446076b/contract';
import endContract from '../../snapshots/bcf83432ae3ff8e4f022329c860c98fd8237153797d52b97b54632e3b446076b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'project',
        column: col('webhookToken', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('avatarUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'project',
        constraint: 'project_webhookToken_key',
        columns: ['webhookToken'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
