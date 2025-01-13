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

import { EventFilter } from "./EventFilter.js";
import { BusinessEvent } from "./BusinessEvent.js";
import { Components } from "../view/Components.js";
import { ViewComponent } from "../public/ViewComponent.js";
import { BusinessEventListener } from "./BusinessEventListener.js";


export class BusinessEvents implements EventListenerObject
{
   private static keys$:string[] =
   [
      'Tab',
      'Enter',
      'Escape',
      'PageUp',
      'PageDown',
      'ArrowUp',
      'ArrowDown',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12'
   ];

	private static event$:Event = null;
	private static curr$:TriggerComponent = null;
	private static last$:TriggerComponent = null;
	private static producers$:Map<any,BusinessEventListener[]> = new Map<any,BusinessEventListener[]>();


   /**
    * Add the necessary events
    */
   static
   {
      let handler:BusinessEvents = new BusinessEvents();

		document.addEventListener("input",handler);
		document.addEventListener("keydown",handler);
		document.addEventListener("focusin",handler);
		document.addEventListener("mousedown",handler);
   }


	/**
	 * Ensure static constructor
	 */
	public static initialize() : void
	{
	}


	private constructor() {};


	/**
	 * The current focused Component
	 */
	public static lastEvent() : Event
	{
		return(BusinessEvents.event$);
	}


	/**
	 * The current focused Component
	 */
	public static currentComponent() : any
	{
		return(BusinessEvents.curr$.comp);
	}


	/**
	 * Register a component as producer of business events
	 * @param comp
	 */
	public static async register(comp:any) : Promise<void>
	{
		this.producers$.set(comp,[]);
	}


	/**
	 * Add a listener to a business event producer
	 * @param comp The class to receive events
	 * @param target The class that raise events
	 */
	public static async addListener(comp:BusinessEventListener, filter?:EventFilter) : Promise<void>
	{
		if (filter.component)
		{
			let target = Components.getViewComponent(filter.component);
			let lsnrs:BusinessEventListener[] = this.producers$.get(target);
			if (lsnrs) lsnrs.push(comp);
		}
	}


	/**
	 * Send a business event
	 * @param event
	 */
	public static async send(event:BusinessEvent) : Promise<void>
	{
		let target:ViewComponent = Components.getViewComponent(event.component);
		let lsnrs:BusinessEventListener[] = this.producers$.get(target);

		for (let i = 0; lsnrs && i < lsnrs.length; i++)
		{
			try
			{
				if (!await lsnrs[i].handleBusinessEvent(event))
					break;
			}
			catch (error) {break;}
		}
	}


   /**
    * @param event The event to be handles
    */
   public handleEvent(event:Event) : void
   {
		BusinessEvents.event$ = event;
		let bevent:BusinessEvent = null;

		if (event.target instanceof HTMLElement)
		{
			let trg:TriggerComponent = new TriggerComponent(event.target);

			if (event.type == "focusin" || event.type == "mousedown")
			{
				BusinessEvents.curr$ = trg;

				let comp:any = null;
				let next:ViewComponent[] = trg.getComponents(trg.elem);
				let prev:ViewComponent[] = trg.getComponents(BusinessEvents.last$?.elem);

				if (!trg || trg.vcomp != BusinessEvents.last$?.vcomp)
				{
					if (BusinessEvents.last$?.vcomp)
					{
						for (let i = 0; i < prev.length; i++)
						{
							if (!next.includes(prev[i]))
							{
								comp = Components.getComponent(prev[i]);
								bevent = new BusinessEvent("blur",comp,trg.elem);
								BusinessEvents.send(bevent);
							}
						}
					}

					if (trg.vcomp)
					{
						for (let i = 0; i < next.length; i++)
						{
							if (!prev.includes(next[i]))
							{
								comp = Components.getComponent(next[i]);
								bevent = new BusinessEvent("focus",comp,trg.elem);
								BusinessEvents.send(bevent);
							}
						}
					}

					BusinessEvents.last$ = trg;
				}
			}

			else

			if (trg.vcomp)
			{
				if (event instanceof KeyboardEvent && !BusinessEvents.keys$.includes(event.key))
					return;

				bevent = new BusinessEvent(event.type,trg.comp,trg.elem);
				BusinessEvents.send(bevent);
			}
		}
   }
}


class TriggerComponent
{
	public comp:any = null;
	public root:HTMLElement = null;
	public elem:HTMLElement = null;
	public vcomp:ViewComponent = null;

	constructor(target:HTMLElement)
	{
		this.elem = target;
		this.vcomp = Components.findViewComponent(target);

		if (this.vcomp)
		{
			this.root = this.vcomp.getView();
			this.comp = Components.getComponent(this.vcomp);
		}
	}


	public getComponents(view:HTMLElement) : ViewComponent[]
	{
		let list:ViewComponent[] = [];

		let comp:ViewComponent = Components.findViewComponent(view);

		while (comp)
		{
			list.push(comp);
			view = comp.getView().parentElement;
			comp = Components.findViewComponent(view);
		}

		return(list);
	}
}