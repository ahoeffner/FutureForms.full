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

import { isViewComponent, ViewComponent } from "../public/ViewComponent.js";


export class Components
{
	private static binds$:Map<ViewComponent,any> =
		new Map<ViewComponent,any>();

	private static comps$:Map<any,ViewComponent> =
		new Map<any,ViewComponent>();

	private static views$:Map<HTMLElement,ViewComponent> =
   	new Map<HTMLElement,ViewComponent>();


	public static add(view:ViewComponent) : void
	{
		let element:HTMLElement = view?.getView();
		if (element) Components.views$.set(element,view);
	}


	public static bind(comp:any, view:ViewComponent) : void
	{
		this.comps$.set(comp,view);
		this.binds$.set(view,comp);
	}


	public static remove(view:ViewComponent) : void
	{
		let element:HTMLElement = view?.getView();
		if (element) Components.views$.delete(element);
	}


	public static release(comp:any) : void
	{
		this.comps$.delete(comp);
	}


	public static getComponent(vcomp:ViewComponent) : any
	{
		let comp:any = this.binds$.get(vcomp);
		return(comp ? comp : vcomp);
	}


	public static getViewComponent(comp:any) : ViewComponent
	{
		if (isViewComponent(comp))
			return(comp);

		return(this.comps$.get(comp));
	}


	public static findViewComponent(element:HTMLElement) : ViewComponent
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


	public static getViewComponents() : ViewComponent[]
	{
		let comps:ViewComponent[] = [];
		Components.views$.forEach((comp) => comps.push(comp));
		return(comps);
	}
}