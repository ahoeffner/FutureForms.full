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

import { Record } from "./Record.js";
import { Form as ViewForm } from '../view/Form.js';
import { Form as Parent } from '../../public/Form.js';


/**
 * This class handles all model related stuff.
 * It has links to the public interface as well as the view.
 * The class is not exposed to the end developer
 */
export class Form
{
	private parent$:Parent = null;
	private view$:ViewForm = null;

	private sources$:Map<string,Source> =
		new Map<string,Source>();



	constructor(parent:Parent)
	{
		this.parent$ = parent;
	}

	public get parent() : Parent
	{
		return(this.parent$);
	}

	public get view() : ViewForm
	{
		return(this.view$);
	}

	public set view(form:ViewForm)
	{
		this.view$ = form;
	}


	public async getValue(source:string, name:string, offset:number = 0) : Promise<any>
	{
		let ds:Source = this.getSource(source);
		return(ds.getValue(name,offset));
	}


	public async setValue(source:string, name:string, record:number, value:any, validate:Validation = Validation.None, evsrc:HTMLElement = null) : Promise<boolean>
	{
		let ds:Source = this.getSource(source);
		let row:number = record - this.view$.offset;
		this.view$.distribute(source,name,row,value,evsrc);
		return(ds.setValue(name,record,value,validate));
	}


	private getSource(name:string) : Source
	{
		name = name?.toLowerCase();
		let source:Source = this.sources$.get(name);

		if (source === undefined)
		{
			source = new Source();
			this.sources$.set(name,source);
		}

		return(source);
	}
}


export enum Validation
{
	None,
	Delayed,
	Required
}


class Source
{
	private records$:Map<number,Record> =
		new Map<number,Record>();


	public getValue(name:string, offset:number) : Promise<any>
	{
		let record:Record = this.records$.get(offset);
		if (!record) return(null);
		return(record.getField(name).getVolatileValue());
	}


	public async setValue(name:string, offset:number, value:any, validate:Validation) : Promise<boolean>
	{
		let record:Record = this.records$.get(offset);

		if (!record)
		{
			record = new Record();
			this.records$.set(offset,record);
		}

		record.setValue(name,value);
		return(true);
	}
}