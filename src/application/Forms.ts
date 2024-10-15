/*
  MIT License

  Copyright © 2023 Alex Høffner

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

import { Form } from "../public/Form.js";
import { Form as ViewForm } from "../view/Form.js";
import { Form as ModelForm } from "../model/Form.js";


export class Forms
{
	private static forms$:Map<Form,HTMLElement> =
		new Map<Form,HTMLElement>();

	private static views$:Map<HTMLElement,FormEntry> =
   	new Map<HTMLElement,FormEntry>();


	public static add(form:Form, view:ViewForm, model:ModelForm) : void
	{
		let elem:HTMLElement = view?.getView();

		if (elem)
		{
			Forms.forms$.set(form,elem);
			Forms.views$.set(elem,new FormEntry(form,view,model));
		}
		else
		{
			Forms.remove(form);
		}
	}


	public static remove(form:Form) : void
	{
		let view:HTMLElement = this.forms$.get(form);

		Forms.forms$.delete(form);
		Forms.views$.delete(view);
	}


	public static getActiveForm(element:HTMLElement) : Form
	{
		let entry:FormEntry = null;

		while(element != document.body)
		{
			entry = this.views$.get(element);
			if (entry) return(entry.form);
			element = element.parentElement;
		}

		return(null);
	}
}


class FormEntry
{
	constructor(public form:Form, public view:ViewForm, public model:ModelForm) {}
}