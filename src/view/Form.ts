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
import { Form as ModelForm } from "../model/Form.js";
import { ViewMediator } from "../public/ViewMediator.js";
import { ViewComponent } from "../public/ViewComponent.js";
import { BusinessEvent } from "../events/BusinessEvent.js";
import { BusinessEvents } from "../events/BusinessEvents.js";
import { EventQueue } from "../events/EventQueue.js";


/**
 * This class handles all view and user interaction related stuff.
 * It has links to the public interface as well as the model.
 * The class is not exposed to the end developer
 */
export class Form implements ViewComponent
{
	private static queue$:EventQueue = new EventQueue("formevents");

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

	private form$:Parent = null;
	private model$:ModelForm = null;
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

	public get model() : ModelForm
	{
		return(this.model$);
	}

	public set model(form:ModelForm)
	{
		this.model$ = form;
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


	public async handleBusinessEvent(event:BusinessEvent) : Promise<boolean>
	{
		event.properties.set("field",event.target.getAttribute("name"));
		event.properties.set("source",event.target.getAttribute("source"));

		await EventQueue.DefaultEventQueue.getSlot();
		BusinessEvents.send(event);

		return(true);
	}
}