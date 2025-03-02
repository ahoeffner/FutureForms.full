/*
  MIT License

  Copyright © 2024 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Form } from "../public/Form.js";
import { BusinessEvent } from "../events/BusinessEvent.js";
import { EventFilter, FilterComparator } from "../events/EventFilter.js";


const FormEventComparator:FilterComparator = (event:BusinessEvent, filter:FormEventFilter) =>
{
	let match:number = 0;

	if (EventFilter.DefaultComparator(event,filter) < 0)
		return(-1);

	if (filter.source)
	{
		if (filter.source != event.properties.get("source"))
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
		EventFilter.register(FormEventFilter,FormEventComparator);
	}

	constructor(component:Form|string, type?:string, public source?:string, public field?:string)
	{
		super();
		this.type = type;
		this.component = component;
	}
}