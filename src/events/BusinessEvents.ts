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

import { Class } from "../public/Class.js";
import { BusinessEvent } from "./BusinessEvent.js";
import { Components } from "../components/Components.js";
import { Destination, isBusinessEventListener } from "./BusinessEventListener.js";
import { ViewComponent } from "../public/ViewComponent.js";
import { EventFilter, FilterComparator } from "./EventFilter.js";


export class BusinessEvents implements EventListenerObject
{
	private static event$:Event = null;
	private static curr$:TriggerComponent = null;
	private static last$:TriggerComponent = null;
	private static producers$:Map<any,Listener[]> = new Map<any,Listener[]>();


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
	public static addListener(comp:Destination, filter?:EventFilter) : Listener
	{
		let listener:Listener = null;

		if (filter.component && typeof filter.component !== "string")
		{
			let target = Components.getViewComponent(filter.component);
			let lsnrs:Listener[] = this.producers$.get(target);
			if (lsnrs)
			{
				listener = new Listener(comp,filter);
				lsnrs.push(listener);
			}
		}
		else
		{
			let lsnrs:Listener[] = this.producers$.get(null);
			if (!lsnrs) {lsnrs = []; this.producers$.set(null,lsnrs);}
			listener = new Listener(comp,filter);
			lsnrs.push(listener);
		}

		return(listener);
	}


	/**
	 * Send a business event
	 * @param event
	 */
	public static async send(event:BusinessEvent) : Promise<void>
	{
		let lsnrs:Listener[] = []; // Listeners
		let chits:Listener[] = [];	// Component listener hits
		let ahits:Listener[] = [];	// Component agnostic listener hits

		let target:ViewComponent = Components.getViewComponent(event.component);

		if (target)
		{
			lsnrs = this.producers$.get(target);

			// Find all component listeners that match the event
			if (lsnrs) for (let i = 0; i < lsnrs.length; i++)
			{
				let ftype:Class<EventFilter> = lsnrs[i].filter.constructor as Class<EventFilter>;

				let comparator:FilterComparator = EventFilter.getComparator(ftype);
				if (!comparator) comparator = EventFilter.DefaultComparator;

				lsnrs[i].match = comparator(event,lsnrs[i].filter);
				if (lsnrs[i].match >= 0) chits.push(lsnrs[i]);
			}
		}

		// Find component agnostic listeners that match the event
		lsnrs = this.producers$.get(null);

		if (lsnrs) for (let i = 0; i < lsnrs.length; i++)
		{
			let ftype:Class<EventFilter> = lsnrs[i].filter.constructor as Class<EventFilter>;

			let comparator:FilterComparator = EventFilter.getComparator(ftype);
			if (!comparator) comparator = EventFilter.DefaultComparator;

			lsnrs[i].match = comparator(event,lsnrs[i].filter);
			if (lsnrs[i].match >= 0) ahits.push(lsnrs[i]);
		}

		// Sort the listeners by match
		chits = chits?.sort((a,b) => b.match - a.match);
		ahits = ahits?.sort((a,b) => b.match - a.match);

		// Add no component listeners
		lsnrs = chits.concat(ahits);

		for (let i = 0; i < lsnrs.length; i++)
		{
			try
			{
				if (!await this.invoke(lsnrs[i].destination,event))
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
								bevent = new BusinessEvent("leave",comp,trg.elem);
								prev[i].propagateBusinessEvent(bevent);
							}
						}
					}

					if (trg.vcomp)
					{
						for (let i = next.length - 1; i >= 0; i--)
						{
							if (!prev.includes(next[i]))
							{
								comp = Components.getComponent(next[i]);
								bevent = new BusinessEvent("enter",comp,trg.elem);
								next[i].propagateBusinessEvent(bevent);
							}
						}
					}

					BusinessEvents.last$ = trg;
				}

				if (trg.vcomp && event.type == "focusin")
				{
					bevent = new BusinessEvent("focus",trg.comp,trg.elem);
					trg.vcomp.propagateBusinessEvent(bevent)
				}
			}

			else

			if (trg.vcomp)
			{
				bevent = new BusinessEvent(event.type,trg.comp,trg.elem);
				trg.vcomp.propagateBusinessEvent(bevent)
			}
		}
   }


	private static async invoke(destination:Destination, event:BusinessEvent) : Promise<boolean>
	{
		let success:boolean = false;

		if (destination.component && destination.function)
		{
			let func:string = destination.function.name;
			success = await destination.component[func](event);
		}

		if (success == null)
			success = false;

		return(success);
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


export class Listener
{
	public match:number = 0;
	public filter:EventFilter = null;
	public destination:Destination = null;

	constructor(destination:Destination, filter:EventFilter)
	{
		this.filter = filter;
		this.destination = destination;

		if (!destination.function)
		{
			if (isBusinessEventListener(destination.component))
				this.destination.function = destination.component.handleBusinessEvent;
		}
	}
}