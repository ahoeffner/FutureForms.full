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

import { ViewComponent } from "../public/ViewComponent.js";


export class Components
{
	private static comps$:Map<ViewComponent,HTMLElement> =
		new Map<ViewComponent,HTMLElement>();

	private static views$:Map<HTMLElement,ViewComponent> =
   	new Map<HTMLElement,ViewComponent>();


	public static add(form:ViewComponent) : void
	{
		let elem:HTMLElement = form?.getView();

		if (elem)
		{
			Components.comps$.set(form,elem);
			Components.views$.set(elem,form);
		}
	}


	public static remove(form:ViewComponent) : void
	{
		let view:HTMLElement = this.comps$.get(form);

		Components.comps$.delete(form);
		Components.views$.delete(view);
	}


	public static getComponent(element:HTMLElement) : ViewComponent
	{
		let comp:ViewComponent = null;

		while(element && element != document.body)
		{
			comp = this.views$.get(element);
			if (comp) break;

			element = element.parentElement;
		}

		return(comp);
	}
}