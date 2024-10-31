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

import { Components } from "../view/Components.js";
import { ViewComponent } from "../public/ViewComponent.js";


export class EventHandler implements EventListenerObject
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

	private static last$:ViewComponent = null;
	private static current$:ViewComponent = null;


   /**
    * Add the necessary events
    */
   static
   {
      let handler:EventHandler = new EventHandler();

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
	 * The current focused ViewComponent
	 */
	public static get current() : ViewComponent
	{
		return(EventHandler.current$);
	}


	public static async sendCustomEvent(event:CustomEvent) : Promise<void>
	{
		// Send event to all listeners
	}


   /**
    * @param event The event to be handles
    * @returns
    */
   public handleEvent(event:Event) : void
   {
		if (event.target instanceof HTMLElement)
		{
			let comp:ViewComponent = Components.getComponent(event.target);

			if (event.type == "focusin" || event.type == "click")
			{
				EventHandler.current$ = comp;

				if (comp != EventHandler.last$)
				{
					let detail:any = null;
					let cevent:CustomEvent = null;

					if (EventHandler.last$)
					{
						detail = {targetElement: EventHandler.last$.getView()};
						cevent = new CustomEvent("blur",{detail: detail});
						this.bubble(EventHandler.last$,cevent);
					}

					if (comp)
					{
						detail = {targetElement: comp.getView()};
						cevent = new CustomEvent("focus",{detail: detail});
						this.bubble(comp,cevent);
					}

					EventHandler.last$ = comp;
				}
			}

			if (comp)
			{
				if (event instanceof KeyboardEvent && !EventHandler.keys$.includes(event.key))
					return;

				comp.handleEvent(event);
			}
		}
   }


	private bubble(comp:ViewComponent, event:Event) : void
	{
		while(comp)
		{
			comp.handleEvent(event);
			comp = comp?.parent;
		}
	}
}