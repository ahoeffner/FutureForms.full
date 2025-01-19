import { BusinessEvent } from "../events/BusinessEvent.js";
import { EventFilter, FilterComparator } from "../events/EventFilter.js";


const FormEventHandler:FilterComparator = (event:BusinessEvent, filter:FormEventFilter) =>
{
	let match:number = 0;

	if (event.component)
	{
		if (event.component != filter.component)
			return(-1);

		match++;
	}

	if (filter.block)
	{
		if (filter.block != event.properties.get("block"))
			return(-1);

		match++;
	}

	if (filter.field)
	{
		if (filter.field != event.properties.get("field"))
			return(-1);

		match++;
	}

	return(match);
}


export class FormEventFilter extends EventFilter
{
	static
	{
		EventFilter.register(FormEventFilter,FormEventHandler);
	}

	constructor(type:string,component:string,public block?:string,public field?:string)
	{
		super();
	}
}
