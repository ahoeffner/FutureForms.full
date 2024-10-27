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
	private move$:boolean = false;
	private cursor$:string = null;
	private element$:HTMLElement = null;

	private mouse$:{x:number, y:number} = null;
	private position$:{x:number, y:number} = null;
	private boundary$:{x:number, y:number, w:number, h:number} = null;


	public set element(element:HTMLElement)
	{
		this.element$ = element;
		this.cursor$ = element.style.cursor;
	}


	public handleEvent(event:MouseEvent) : void
	{
		if (event.type.indexOf("mouse") < 0)
			return;

		if (event.type == "mouseup")
		{
			this.down$ = null;
			this.move$ = false;
			this.element$.style.cursor = this.cursor$;
		}

		if (event.type == "mouseout")
		{
			this.move$ = false;
			this.element$.style.cursor = this.cursor$;
		}

		if (event.type == "mousemove" && this.move$)
		{
			event.preventDefault();
			this.move(event,this.element$);
		}

		if (event.type == "mousedown")
		{
			this.down$ = Date.now();
			setTimeout(() => {this.prepare(this.element$)},this.hold);
		}
	}


	private prepare(element:HTMLElement) : void
	{
		this.move$ = false;

		this.mouse$ = null;
		this.position$ = null;
		this.boundary$ = null;

		if (!this.down$ || Date.now() - this.down$ < this.hold)
			return;

		this.move$ = true;
		this.mouse$ = {x: -1, y: -1};
		element.style.cursor = "move";

		this.position$ =
		{
			y: +element.offsetTop,
			x: +element.offsetLeft
		}

		this.boundary$ =
		{
			y: element.parentElement.offsetTop,
			x: element.parentElement.offsetLeft,
			w: element.parentElement.offsetWidth,
			h: element.parentElement.offsetHeight
		};

		let type:string = window.getComputedStyle(element.parentElement).position;

		if (type == "static") type = "";
		if (type == "fixed")	type = "absolute";
		if (type == "sticky") type = "relative";

		switch(type)
		{
			case "" :

				this.boundary$.w += this.boundary$.x;
				this.boundary$.h += this.boundary$.y;

				this.position$.y -= element.offsetTop;
				this.position$.x -= element.offsetLeft;

				break;

			case "absolute" :

				this.boundary$.x = 0;
				this.boundary$.y = 0;

				let parent:HTMLElement = element.parentElement;

				this.boundary$.w = parent.parentElement.clientWidth;
				this.boundary$.h = parent.parentElement.clientHeight;

				break;

			case "relative" :

				this.boundary$.x = 0;
				this.boundary$.y = 0;

				break;
		}
	}


	private move(event:MouseEvent, element:HTMLElement) : void
	{
		if (this.mouse$.x < 0)
		{
			this.mouse$.x = event.clientX;
			this.mouse$.y = event.clientY;
			console.log("mouse (x,y) "+this.mouse$.x+" "+this.mouse$.y)
			console.log(this.mouse$);
			console.log("element (x,y) "+element.offsetLeft+" "+element.offsetTop);
			return;
		}

		let offX:number = event.clientX - this.mouse$.x;
		let offY:number = event.clientY - this.mouse$.y;

		let elemY:number = element.offsetTop;
		let elemX:number = element.offsetLeft;
		let elemW:number = element.offsetWidth;
		let elemH:number = element.offsetHeight;

		let posX:number = this.position$.x + offX;
		let posY:number = this.position$.y + offY;

		let minX:number = this.boundary$.x;
		let minY:number = this.boundary$.y;

		let maxX:number = this.boundary$.w + elemW;
		let maxY:number = this.boundary$.h + elemH;

		if (posX < minX) posX = minX;
		if (posY < minY) posY = minY;

		if (posX > maxX) posX = maxX;
		if (posY > maxY) posY = maxY;

		element.style.top = posY + "px";
		element.style.left = posX + "px";
	}
}