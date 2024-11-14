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

	private static curr$:TriggerComponent = null;
	private static last$:TriggerComponent = null;
	private static producers$:Map<any,BusinessEventListener[]> = new Map<any,BusinessEventListener[]>();


   /**
    * Add the necessary events
    */
   static
   {
      let handler:BusinessEvents = new BusinessEvents();

		document.addEventListener("click",handler);
		document.addEventListener("input",handler);
		document.addEventListener("keydown",handler);
		document.addEventListener("focusin",handler);
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
	public static get current() : any
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
	 * @param target The producer of business events
	 */
	public static async addListener(comp:BusinessEventListener, target:any) : Promise<void>
	{
		target = Components.getViewComponent(target);
		let lsnrs:BusinessEventListener[] = this.producers$.get(target);
		if (lsnrs) lsnrs.push(comp);
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
		let bevent:BusinessEvent = null;

		if (event.target instanceof HTMLElement)
		{
			let trg:TriggerComponent = new TriggerComponent(event.target);

			if (event.type == "focusin" || event.type == "click")
			{
				BusinessEvents.curr$ = trg;

				if (trg.vcomp != BusinessEvents.last$?.vcomp)
				{
					if (BusinessEvents.last$?.vcomp)
					{
						bevent = new BusinessEvent("blur",BusinessEvents.last$.comp,BusinessEvents.last$.elem);
						BusinessEvents.send(bevent);
					}

					if (trg.vcomp)
					{
						bevent = new BusinessEvent("focus",trg.comp,trg.elem);
						BusinessEvents.send(bevent);
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
}