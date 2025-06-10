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

      let parser:Parser = new Parser();
      await parser.parse(view);

		this.view$ = view;
		Components.add(this);
   }


	public async propagateBusinessEvent(event:BusinessEvent) : Promise<boolean>
	{
		let row = +event.target.getAttribute("row");
		let field = event.target.getAttribute("name")?.toLocaleLowerCase();
		let source = event.target.getAttribute("source")?.toLocaleLowerCase();

		if (field && source)
		{
			if ((!row || isNaN(row)))
				row = -1;
		}

		event.properties.set("row",row);
		event.properties.set("field",field);
		event.properties.set("source",source);

		try
		{
			await EventQueue.DefaultEventQueue.getSlot();
			await this.handleBusinessEvent(event);
			return(true);
		}
		catch (error)
		{
			console.error("Error handling business event:", error);
			return(false);
		}
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