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


export class ViewMediator
{
	private static current$:ViewMediator = new ViewMediator();


	public static get impl() : ViewMediator
	{
		return(ViewMediator.current$);
	}

	public static set impl(mediator:ViewMediator)
	{
		ViewMediator.current$ = mediator;
	}


	public block(element:HTMLElement) : void
	{
		// Drop focus on the element before blocking
		if (document.activeElement instanceof HTMLElement)
		{
			if (element.contains(document.activeElement))
				document.activeElement.blur();
		}

		let overlay:HTMLDivElement = document.createElement('div');

		let top:number = element.offsetTop;
		let left:number = element.offsetLeft;
		let width:number = element.offsetWidth;
		let height:number = element.offsetHeight;

		overlay.style.position = 'absolute';
		overlay.setAttribute("name","impassable");

		overlay.style.top = top+"px";
		overlay.style.left = left+"px";
		overlay.style.width = width+"px";
		overlay.style.height = height+"px";
		overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

		overlay.addEventListener("click",(event) => {event.stopPropagation()});
		element.appendChild(overlay);
	}


	public unblock(element:HTMLElement) : void
	{
		element.children.item(element.children.length-1).remove();
	}
}