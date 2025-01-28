import { Service } from 'typedi';
import { AddService } from '../../../../../../shared/services/db/add.Service';
import { ToDoEntity } from '../../../../infrastructures/entity/todos/index.Entity';

@Service()
export class AddTodosService extends AddService<ToDoEntity> {
	public constructor() {
		super(ToDoEntity);
	}
}
