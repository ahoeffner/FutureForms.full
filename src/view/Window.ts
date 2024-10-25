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
import { Window as Parent } from "../public/Window.js";
import { ViewMediator } from "../public/ViewMediator.js";
import { ViewComponent } from "../public/ViewComponent.js";


export class Window implements ViewComponent
{
	private comps$:any[] = [];
	private window$:Parent = null;
	private view$:HTMLElement = null;
	private parent$:ViewComponent = null;
	private mhandler:MouseHandler = new MouseHandler();


	constructor(window:Parent)
	{
		this.window$ = window;
		Components.bind(this.window$,this);
	}

	public get parent() : ViewComponent
	{
		return(this.parent$);
	}

	public set parent(parent:ViewComponent)
	{
		this.parent$ = parent;
	}

	public getView() : HTMLElement
	{
		return(this.view$);
	}

	public getComponents() : any[]
	{
		return(this.comps$);
	}


	public addComponent(comp:any) : void
	{
		this.comps$.push(comp);
	}


	public removeComponent(comp:any) : void
	{
		let pos:number = this.comps$.indexOf(comp);
		if (pos >= 0) this.comps$.splice(pos,1);
	}


   public async setView(view:HTMLElement) : Promise<void>
   {
		Components.remove(this);

      let parser:Parser = new Parser();
      await parser.parse(view);

		this.comps$ = parser.getComponents();

		this.comps$.forEach((comp) =>
		{
			comp = Components.getViewComponent(comp);
			if (comp) comp.parent = this;
		})

		this.view$ = view;
		Components.add(this);

		this.mhandler.element = this.view$;

		this.view$.addEventListener("mouseout",this);
		this.view$.addEventListener("mouseover",this);

		this.view$.addEventListener("mouseup",this);
		this.view$.addEventListener("mousemove",this);
		this.view$.addEventListener("mousedown",this);
   }


	public pause() : void
	{
		ViewMediator.impl.block(this.view$);
	}


	public resume() : void
	{
		ViewMediator.impl.unblock(this.view$);
	}


	public handleEvent(event:Event) : void
	{
		if (event instanceof MouseEvent)
			this.mhandler.handleEvent(event);
	}
}


class MouseHandler
{
	private hold:number = 300;
	private down$:number = null;
	private cursor$:string = null;
	private element$:HTMLElement = null;

	public set element(element:HTMLElement)
	{
		this.element$ = element;
		this.cursor$ = element.style.cursor;
	}

	public handleEvent(event:Event) : void
	{
		if (event.type.indexOf("mouse") < 0)
			return;

		if (event.type == "mouseup")
		{
			this.element$.style.cursor = this.cursor$;
			this.down$ = null;
		}

		if (event.type == "mouseout")
			this.element$.style.cursor = this.cursor$;

		if (event.type == "mousedown")
		{
			this.down$ = Date.now();
			setTimeout(() => {this.armed(this.element$)},this.hold);
		}
	}


	private armed(window:HTMLElement) : void
	{
		if (this.down$ && Date.now() - this.down$ > this.hold)
		{
			window.style.cursor = "move";
		}
	}
}