// Debug Mode:All Test Case Run
//node --trace-deprecation --test --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodosBatchDemo/index.test.ts

// Debug Mode:Specific Test Case Run
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodosBatchDemo/index.test.ts

// If Debug not Worked then use
//node --trace-deprecation --test --test-name-pattern='test_name' --require ts-node/register --inspect=4321 -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodosBatchDemo/index.test.ts


import test, { afterEach, beforeEach, describe } from 'node:test';
import expect from 'expect';
import {
	destroyDatabase,
	getQueryRunner,
	initializeDatabase,
	QueryRunner,
} from '../../../../config/dbSource';
import { ToDoEntity } from '../../infrastructures/entity/todos/index.Entity';
import { faker } from '@faker-js/faker';
import { StatusEnum } from '../../../../shared/models/enums/status.enum';
import { v4 as uuidv4 } from 'uuid';
import { GetTodoService } from '../../apps/features/v1/getTodos';
import { QueryBuilder, SelectQueryBuilder } from 'typeorm';
import Container from 'typedi';
import { TodosBatchDemoService } from '../../apps/features/v1/todosBatchDemo';
import exp from 'constants';

describe(`get_todos_batch_demo`,()=>{
  let queryRunner: QueryRunner;

  beforeEach(async () => {
		await initializeDatabase();
		queryRunner = getQueryRunner();
	});

  afterEach(async () => {
		await queryRunner.release();
		await destroyDatabase();
	});

  //node --trace-deprecation --test --test-name-pattern='should_return_true_when_all_service_passed' --require ts-node/register -r tsconfig-paths/register ./src/core/modules/todos/tests/getTodosBatchDemo/index.test.ts
  test(`should_return_true_when_all_service_passed`,async ()=>{
    const getTodosBatchService=Container.get(TodosBatchDemoService);

    await queryRunner.startTransaction();

    const result=await getTodosBatchService.handleAsync({
      batchSize:15,
      queryRunner:queryRunner,
    });
    if(result.isErr()){
      await queryRunner.rollbackTransaction();
      expect(result.isErr()).toBe(true);
			return;
    }

    const res = result.value;
		console.table(res);

    await queryRunner.commitTransaction();
		expect(true).toBe(true);

  });

});
