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


import { Parser } from "./Parser.js";
import { Field } from "./tags/Field.js";
import { Components } from "./Components.js";
import { Form as Parent } from "../public/Form.js";
import { EventQueue } from "../events/EventQueue.js";
import { ViewMediator } from "../public/ViewMediator.js";
import { ViewComponent } from "../public/ViewComponent.js";
import { BusinessEvent } from "../events/BusinessEvent.js";
import { BusinessEvents } from "../events/BusinessEvents.js";


/**
 * This class handles the ViewComponent related stuff.
 * The class forms/view/Forms inherits from this and handles the form logic.
 */
export class Form implements ViewComponent
{
	private form$:Parent = null;
	private view$:HTMLElement = null;
	private parent$:ViewComponent = null;
	private parser$:Parser = new Parser();

	private field$:any = null;
	private value$:any = null;


   constructor(form:Parent)
   {
		this.form$ = form;
		BusinessEvents.register(this);
		Components.bind(this.form$,this);
   }

	public get form() : Parent
	{
		return(this.form$);
	}

	public get parent() : ViewComponent
	{
		return(this.parent$);
	}

	public set parent(parent:ViewComponent)
	{
		this.parent$ = parent;
	}

	public pause() : void
	{
		ViewMediator.impl.block(this.view$);
	}

	public resume() : void
	{
		ViewMediator.impl.unblock(this.view$);
	}

	public getView() : HTMLElement
	{
		return(this.view$);
	}


   public async setView(view:HTMLElement) : Promise<void>
   {
		Components.remove(this);
		await this.parser$.parse(view);

		this.view$ = view;
		Components.add(this);

		this.parse();
   }


	public async propagateBusinessEvent(event:BusinessEvent) : Promise<boolean>
	{
		let row = +event.target.getAttribute(Field.ROW);
		let field = event.target.getAttribute(Field.NAME)?.toLocaleLowerCase();
		let source = event.target.getAttribute(Field.SOURCE)?.toLocaleLowerCase();

		console.log(event.type+" "+field)

		if (event.type == "focus" && field && source)
		{
			this.field$ = event.target;
			this.value$ = ViewMediator.impl.getValue(event.target);
			console.log("Remember name:",field,"source:",source,"row:",row,"value:",this.value$);
		}

		if (event.type == "input")
		{
			console.log(event.target,event.target == this.field$,event.target.hasAttribute("readonly"));
		}

		if (event.target == this.field$ && event.target.hasAttribute("readonly"))
		{
			console.log("Block event for readonly field",event.target);
			ViewMediator.impl.setValue(event.target,this.value$);
			return;
		}


		event.properties.set(Field.ROW,row);
		event.properties.set(Field.FIELD,field);
		event.properties.set(Field.SOURCE,source);

		await this.handleBusinessEvent(event);
	}


	/**
	 * This method is used to send a business event to the event queue.
	 * It should be called by the inheriting class to trigger events to all listeners.
	 * @param event The business event to send.
	 * @returns {Promise<boolean>} Returns true if the event was sent successfully, false otherwise.
	 */
	public async sendEvent(event:BusinessEvent) : Promise<boolean>
	{
		try
		{
			await EventQueue.DefaultEventQueue.getSlot();
			let result:boolean = await BusinessEvents.send(event);
			return(result);
		}
		catch (error)
		{
			console.error("Error handling business event:", error);
			return(false);
		}
	}


	/**
	 * This method is called when the components view is changed.
	 * It should be overridden by the inheriting class to handle form definition.
	 */
	protected async parse() : Promise<void>
	{
	}


	/**
	 * This method is called when a business event is propagated to this component.
	 * It should be overridden by the inheriting class to handle the event.
	 * @param event The business event to handle.
	 */
	protected async handleBusinessEvent(event:BusinessEvent) : Promise<void>
	{
	}
}