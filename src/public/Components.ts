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

import { Class } from "./Class.js";
import { Window } from "../view/Window.js";
import { ViewComponent } from "./ViewComponent.js";
import { Components as ViewComponents } from "../view/Components.js";
import { ComponentFactory, DefaultViewComponentFactory } from "./ComponentFactory.js";


class ComponentEntry
{
   constructor(public clazz:Class<any>, public factory:Class<ComponentFactory>) {}
}

export class Components
{
   private static classes$:Map<string,ComponentEntry> =
      Components.buildins();


	private static buildins() : Map<string,any>
	{
		let buildins:Map<string,any> = new Map<string,any>();
		buildins.set("window",new ComponentEntry(Window,DefaultViewComponentFactory));
		return(buildins);
	}


   public static async create(tagname:string, element:HTMLElement) : Promise<any>
   {
      let entry:ComponentEntry = this.classes$.get(tagname.toLowerCase());
		if (!entry) return(null);

      let factory:ComponentFactory = new entry.factory();
      return(await factory.instantiate(entry.clazz,element));
   }


   public static register(tagname:string, clazz:Class<any>, factory?:Class<ComponentFactory>) : void
   {
      if (!factory) factory = DefaultViewComponentFactory;
      this.classes$.set(tagname.toLowerCase(),new ComponentEntry(clazz,factory));
   }


	public static addViewObject(comp:ViewComponent) : void
	{
		ViewComponents.add(comp);
	}


	public static removeViewObject(comp:ViewComponent) : void
	{
		ViewComponents.remove(comp);
	}
}