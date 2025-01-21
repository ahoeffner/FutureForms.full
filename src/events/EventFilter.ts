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

import { Class } from "../public/Class";
import { BusinessEvent } from "./BusinessEvent";


export class EventFilter
{
	private static handlers$:Map<Class<EventFilter>,FilterComparator> = new Map<Class<EventFilter>,FilterComparator>();

	/**
	 * Register a new filter
	 * @param filter The filter to register
	 * @param comparator The comparator to use
	 */
	public static register(filter:Class<EventFilter>, comparator:FilterComparator) : void
	{
		EventFilter.handlers$.set(filter,comparator);
	}


	/**
	 * Remove the filter
	 */
	remove(filter:Class<EventFilter>) : void
	{
		EventFilter.handlers$.delete(filter);
	}


	/**
	 * Get the comparator for the filter
	 * @param filter The filter to get the comparator for
	 */
	public static getComparator(filter:Class<EventFilter>) : FilterComparator
	{
		return(EventFilter.handlers$.get(filter));
	}


	public static DefaultComparator:FilterComparator = (event:BusinessEvent, filter:EventFilter) =>
	{
		let match:number = 0;

		if (event.type)
		{
			if (event.type != filter.type)
				return(-1);

			match++;
		}

		if (event.component)
		{
			if (typeof filter.component === "string")
			{
				if (Object.hasOwn(event,"name"))
				{
					if (event["name"] != filter.component)
						return(-1);
				}
				else
				{
					if (event.constructor.name != filter.component)
						return(-1);
				}
			}
			else if (event.component != filter.component)
			{
				return(-1);
			}

			match++;
		}

		return(match);
	}

	/** The event to filter on */
	public type?:string = null;

	/** The component to filter on */
	public component?:any = null;
}

/** The return value indicates the match. Less than 0 means no match */
export type FilterComparator = (event:BusinessEvent, filter:EventFilter) => number;