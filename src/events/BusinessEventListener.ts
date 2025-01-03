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

import { BusinessEvent } from "./BusinessEvent.js";


/**
 * BusinessEvents are handled asyncronious allowing for comunication
 * with backend systems. Also, they are handled in an orderly manner, one by one
 */
export interface BusinessEventListener
{
	/**
	 * The priority compared to other listeners.
	 * When an event is raised, all eligable listeners
	 * are sorted by priority before invokation. Undefined goes last.
	 */
	priority?:number;

	/**
	 *
	 * @param event Any BusinessEvent that was registered for
	 * The return value indicates if the next listener should be invoked
	 */
	handleBusinessEvent?(event:BusinessEvent) : Promise<boolean>;
}