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

type Resolve<T> = (arg?:T) => T;

/**
 * Since there is no way to synchronize, and browser often use multi-threading.
 * This in not quarantied, but rather "best effort"
 */
export class EventQueue
{
	private name$:string = null;
	private queue$:Resolve<any>[] = [];


	/**
	 * EventQueue
	 * @param name: Name of the queue
	 */
	public constructor(name:string)
	{
		this.name$ = name;
	}


	/**
	 * Name of the queue
	 */
	public get name() : string
	{
		return(this.name$);
	}


	/**
	 * Send asap. Puts the event on top of list
	 * @param payload: Any payload to be forwarded when the promise is fulfilled
	 * @returns The payload when the promise if fulfilled
	 */
	public asap<T>(payload?:T) : Promise<T>
	{
		let slot:Promise<T> = new Promise((resolve) =>
		{
			this.queue$.unshift(resolve);
			setTimeout(() => {this.check(resolve,payload)},100);
		});

		return(slot);
	}


	/**
	 * Next available slot
	 * @param payload: Any payload to be forwarded when the promise is fulfilled
	 * @returns The payload when the promise if fulfilled
	 */
	public getSlot<T>(payload?:T) : Promise<T>
	{
		let slot:Promise<T> = new Promise((resolve) =>
		{
			this.queue$.push(resolve);
			setTimeout(() => {this.check(resolve,payload)},100);
		});

		return(slot);
	}


	private check(resolve:Resolve<any>, payload:any) : void
	{
		if (this.queue$[0] == resolve)
		{
			// Pop and test again. Might happen
			let check:Resolve<any> = this.queue$.shift();

			if (check == resolve)
			{
				resolve(payload);
				return;
			}

			// Put it back
			else this.queue$.unshift(check);
		}

		// Try again later
		setTimeout(() => {this.check(resolve,payload)},1000);
	}
}