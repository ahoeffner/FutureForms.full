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
import { Source } from "./Source.js";
import { Validation } from "./Form.js";


export class DataSource extends Source
{
	private name$:string = null;

	private records$:Map<number,Record> =
		new Map<number,Record>();


	constructor(name:string)
	{
		super();
		this.name$ = name.toLowerCase();
	}

	public get name() : string
	{
		return(this.name$);
	}


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