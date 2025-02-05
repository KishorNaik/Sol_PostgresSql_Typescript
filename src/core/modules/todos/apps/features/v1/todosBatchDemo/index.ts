import { Service } from 'typedi';
import { IServiceHandlerAsync } from '../../../../../../shared/utils/helpers/services';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';
import { sealed } from '../../../../../../shared/utils/decorators/sealed';
import { Ok, Result } from 'neverthrow';
import {
	ResultError,
	ResultExceptionFactory,
} from '../../../../../../shared/utils/exceptions/results';
import { StatusCodes } from 'http-status-codes';
import { QueryRunner } from 'typeorm';
import { dbDataSource } from '../../../../../../config/dbSource';
import { StatusEnum } from '../../../../../../shared/models/enums/status.enum';

export interface ITodosBatchDemoServiceParameters {
	batchSize: number;
	queryRunner?: QueryRunner;
}

export interface ITodosBatchDemoService
	extends IServiceHandlerAsync<ITodosBatchDemoServiceParameters, ToDoEntity[]> {}

@sealed
@Service()
export class TodosBatchDemoService implements ITodosBatchDemoService {
	public async handleAsync(
		params: ITodosBatchDemoServiceParameters
	): Promise<Result<ToDoEntity[], ResultError>> {
		try {
			if (!params)
				return ResultExceptionFactory.error(StatusCodes.BAD_REQUEST, 'Invalid params');

			const { batchSize, queryRunner } = params;

			// Run Query Runner
			const entityManager = queryRunner ? queryRunner.manager : dbDataSource.manager;

			// Get total count of todos
			const totalCount = await entityManager.count<ToDoEntity>(ToDoEntity, {
				where: {
					status: StatusEnum.ACTIVE,
				},
			});

			const tasks: Promise<ToDoEntity[]>[] = [];
			const numberOfBatches = Math.ceil(totalCount / batchSize);

			for (let i = 0; i < numberOfBatches; i++) {
				const offset = i * batchSize;
				const query = entityManager
					.createQueryBuilder()
					.select('entity')
					.from(ToDoEntity, 'entity')
					.where('entity.status = :status', { status: StatusEnum.ACTIVE })
					.skip(offset)
					.take(batchSize);
				tasks.push(query.getMany());
			}

			const results = await Promise.all(tasks);
			const resultsFlattened = results.flat();

			if (resultsFlattened.length === 0)
				return ResultExceptionFactory.error(StatusCodes.NOT_FOUND, 'No todos found');

			return new Ok(resultsFlattened);
		} catch (ex) {
			const error = ex as Error;
			return ResultExceptionFactory.error(StatusCodes.INTERNAL_SERVER_ERROR, error.message);
		}
	}
}
