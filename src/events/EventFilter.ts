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

import { BusinessEvent } from "./BusinessEvent";

export class EventFilter
{
	static DefaultComparator:FilterComparator = (event:BusinessEvent, filter:EventFilter) =>
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
			if (event.component != filter.component)
				return(-1);

			match++;
		}

		return(match);
	}

	/** The event to filter on */
	public type?:string = null;

	/** The component to filter on */
	public component?:any = null;

	/** Any extra data for use in compare */
	public properties?:Map<any,any> = null;

	/** The comparator to calculate the match */
	public comparator?:FilterComparator = null;
}

/** The return value indicates the match. Less than 0 means no match */
export type FilterComparator = (event:BusinessEvent, filter:EventFilter) => number;