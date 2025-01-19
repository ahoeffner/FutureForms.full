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

export class BusinessEvent extends Event
{
	private component$:any = null;
	private element$:HTMLElement = null;
	private properties$:Map<any,any> = null;


	/**
	 *
	 * @param type The event type, any type can be used
	 * @param component The component that initiated the event
	 * @param element The HTMLElement that initiated the event
	 */
	public constructor(type:string, component?:any, element?:HTMLElement, properties?:Map<any,any>)
	{
		super(type);
		this.element$ = element;
		this.component$ = component;
		this.properties$ = properties;
	}


	/**
	 * The component that initiated the event
	 */
	public get component() : any
	{
		return(this.component$);
	}

	
	/** Any extra data for use in compare */
	public get properties() : Map<any,any>
	{
		return(this.properties$);
	}


	/**
	 * The target element that initiated the event
	 */
	public get target() : HTMLElement
	{
		return(this.element$);
	}
}