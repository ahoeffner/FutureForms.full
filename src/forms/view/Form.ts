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


import { Section } from "./Section.js";
import { Form as Parent } from "../../public/Form.js";
import { Field } from "../../components/tags/Field.js";
import { Form as Model, Validation } from "../model/Form.js";
import { BusinessEvent } from "../../events/BusinessEvent.js";
import { Form as ViewComponent } from "../../components/Form.js";


export class Form extends ViewComponent
{
	private offset:number = 0;
	private model$:Model = null;
	private sections:Map<string,Section> = new Map<string,Section>();


	constructor(parent:Parent)
	{
		super(parent)
	}


	public get model() : Model
	{
		return(this.model$);
	}


	public set model(model:Model)
	{
		this.model$ = model;
	}


	/**
	 * This method is called when a business event is propagated to this component.
	 * @param event The business event to handle.
	 * @returns {boolean} Returns true if the event was handled, false otherwise.
	 */
	protected async handleBusinessEvent(event:BusinessEvent) : Promise<boolean>
	{
		let row:number 	= event.properties.get(Field.ROW);
		let value:any 		= event.properties.get(Field.VALUE);
		let field:string 	= event.properties.get(Field.FIELD);
		let source:string = event.properties.get(Field.SOURCE);

		if (event.type == "input")
		{
			let success:boolean = await super.sendEvent(event);
			if (!success) return(false);

			await this.model.setValue(source,field,row+this.offset,value,Validation.Delayed);
			return(true);
		}

		return(await super.sendEvent(event));
	}


	public getSection(source:string) : Section
	{
		let section:Section = this.sections.get(source);

		if (!section)
		{
			section = new Section(source,this.getView());
			this.sections.set(source,section);
		}

		return(section);
	}
}