#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/bcf83432ae3ff8e4f022329c860c98fd8237153797d52b97b54632e3b446076b/contract';
import endContract from '../../snapshots/bcf83432ae3ff8e4f022329c860c98fd8237153797d52b97b54632e3b446076b/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/d7739665fb6b2960294e06c8f93e4ed269ca7a5c56bfc97d6c8d5a0e91c0a9b8/contract';
import startContract from '../../snapshots/d7739665fb6b2960294e06c8f93e4ed269ca7a5c56bfc97d6c8d5a0e91c0a9b8/contract.json' with { type: 'json' };
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
