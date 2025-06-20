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


import { Form as Parent } from "../../public/Form.js";
import { Field } from "../../components/tags/Field.js";
import { Form as Model, Validation } from "../model/Form.js";
import { BusinessEvent } from "../../events/BusinessEvent.js";
import { Form as ViewComponent } from "../../components/Form.js";


export class Form extends ViewComponent
{
	private offset$:number = 0;
	private current$:number = 0;
	private model$:Model = null;


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


	public get offset() : number
	{
		return(this.offset$);
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

		if (event.type == "focus" && row != null)
		{
			this.current$ = row;
			this.setCurrent(source,row);
		}

		if (event.type == "undo")
		{
			let record:number = row + this.offset$;
			let value:any = await this.model.getValue(source,field,record);
			this.distribute(source,field,row,value,event.target);
			return(true);
		}

		if (event.type == "input")
		{
			let success:boolean = await super.sendEvent(event);
			if (!success) return(false);

			let record:number = row + this.offset$;
			await this.model.setValue(source,field,record,value,Validation.Delayed,event.target);
			return(true);
		}

		return(await super.sendEvent(event));
	}


	public distribute(source:string, field:string, row:number, value:any, evsrc:HTMLElement) : void
	{
		if (row == null)
			row = this.current$;

		this.getView().querySelectorAll("[source='"+source+"' i][name='"+field+"' i]").forEach((elem:HTMLElement) =>
		{
			let frow:number = null;

			if (elem.hasAttribute("row"))
			{
				frow = parseInt(elem.getAttribute("row"));
				if (Number.isNaN(frow)) frow = null;
			}

			if (frow == row || (frow == null && row == this.current$))
			{
				if (elem != evsrc)
					super.setValue(elem,value);
			}
		})
	}


	private async setCurrent(source:string, row:number) : Promise<void>
	{
		let value:any = null;
		let record:number = row + this.offset$;
		let elements:NodeListOf<HTMLElement> = this.getView().querySelectorAll("[source='"+source+"' i]:not([row])");

		for (let i = 0; i < elements.length; i++)
		{
			let elem:HTMLElement = elements[i];
			let name:string = elem.getAttribute("name");
			value = await this.model.getValue(source,name,record);
			super.setValue(elem,value);
		}
	}
}