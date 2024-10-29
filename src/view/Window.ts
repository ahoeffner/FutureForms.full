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
	private move$:boolean = false;
	private cursor$:string = null;
	private element$:HTMLElement = null;
	private mouse$:{x:number, y:number} = null;
	private position$:{x:number, y:number} = null;
	private compensate$:{x:number, y:number} = null;
	private container$:{x1:number, y1:number, x2:number, y2:number} = null;



	public set element(element:HTMLElement)
	{
		this.setup(element);
		this.element$ = element;
	}


	public handleEvent(event:MouseEvent) : void
	{
		if (event.type == "mouseup")
			this.leave();

		if (event.type == "mouseout")
			this.leave();

		if (event.type == "mousemove")
			this.move(event);

		if (event.type == "mousedown")
		{
			if (this.init(event))
				setTimeout(() => {this.check(this.element$)},this.hold);
		}
	}


	private setup(element:HTMLElement) : void
	{
		let parent:HTMLElement = element.parentElement;

		let rect:DOMRect = element.getBoundingClientRect();
		let prect:DOMRect = parent.getBoundingClientRect();
		let postp:string = window.getComputedStyle(element).position;

		let margin =
		{
			y: element.clientTop,
			x: element.clientLeft
		}

		switch(postp)
		{
			case "fixed":

			case "absolute":
				this.container$ =
				{
					x1: prect.x - rect.x,
					y1: prect.y - rect.y,
					x2: prect.width - rect.x + prect.x,
					y2: prect.height - rect.y + prect.y
				}

				this.compensate$ =
				{
					y: rect.y - prect.y - margin.y - window.scrollY,
					x: rect.x - prect.x - margin.x - window.scrollX
				}

				break;

			default:
				this.container$ =
				{
					y1: -element.offsetTop,
					x1: -element.offsetLeft,
					x2: prect.width + prect.x - rect.x,
					y2: prect.height + prect.y - rect.y
				}

				this.compensate$ =
				{
					y: element.offsetTop,
					x: element.offsetLeft
				}
		}
	}


	private init(event:MouseEvent) : boolean
	{
		let rect:DOMRect = this.element$.getBoundingClientRect();

		let y:number = event.clientY - rect.top;
		let x:number = event.clientX - rect.left;

		if (x > rect.width - 15 && y > rect.height - 15)
			return(false);

		this.down$ = Date.now();

		window.addEventListener("mouseup",this);
		window.addEventListener("mouseuout",this);

		this.mouse$ =
		{
			y: event.clientY,
			x: event.clientX
		}

		this.position$ =
		{
			y: this.element$.offsetTop,
			x: this.element$.offsetLeft
		}

		return(true);
	}


	private check(element:HTMLElement) : void
	{
		this.move$ = false;
		this.cursor$ = element.style.cursor;

		if (!this.down$ || Date.now() - this.down$ < this.hold)
			return;

		this.move$ = true;
		element.style.cursor = "move";
	}


	private leave() : void
	{
		this.down$ = null;
		this.move$ = false;
		this.mouse$ = null;
		this.element$.style.cursor = this.cursor$;

		window.removeEventListener("mouseup",this);
		window.removeEventListener("mouseuot",this);
	}


	private move(event:MouseEvent) : void
	{
		if (!this.mouse$)
			return;

		if (!this.move$)
		{
			this.mouse$ =
			{
				y: event.clientY,
				x: event.clientX
			}
		}
		else
		{
			let dy:number = event.clientY - this.mouse$.y;
			let dx:number = event.clientX - this.mouse$.x;

			let x1:number = this.position$.x + dx - this.compensate$.x;
			let y1:number = this.position$.y + dy - this.compensate$.y;

			let x2:number = x1 + this.element$.offsetWidth;
			let y2:number = y1 + this.element$.offsetHeight;

			if (x1 < this.container$.x1) x1 = this.container$.x1;
			if (y1 < this.container$.y1) y1 = this.container$.y1;

			if (x2 > this.container$.x2) x1 = this.container$.x2 - this.element$.offsetWidth;
			if (y2 > this.container$.y2) y1 = this.container$.y2 - this.element$.offsetHeight;

			this.element$.style.top = y1 + "px";
			this.element$.style.left = x1 + "px";
		}
	}
}