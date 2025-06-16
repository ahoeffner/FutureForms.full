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


/**
 * ViewMediator is a singleton class that manages all aspects of the view layer.
 * It is responsible for bringing elements to the front, blocking and unblocking elements,
 * and managing getting and setting values and attributes on elements.
 *
 * To use a different implementation of ViewMediator, set the static impl property.
 * Then override the methods as needed.
 *
 * The default implementation is an instance of ViewMediator itself.
 */
export class ViewMediator
{
	public static zindex:number = 1;
	private static current$:ViewMediator = new ViewMediator();


	public static get impl() : ViewMediator
	{
		return(ViewMediator.current$);
	}

	public static set impl(mediator:ViewMediator)
	{
		ViewMediator.current$ = mediator;
	}


	public getValue(element:HTMLElement) : any
	{
		if (element instanceof HTMLInputElement)
			return(this.getInputValue(element));

		else if (element instanceof HTMLSelectElement)
			return(this.getSelectValue(element));

		else if (element instanceof HTMLTextAreaElement)
			return(this.getTextAreaValue(element));

		else if (element instanceof HTMLButtonElement)
		{
			return(element.textContent || "");
		}

		else if (element instanceof HTMLLabelElement)
		{
			return(element.textContent || "");
		}

		else if (element instanceof HTMLDivElement || element instanceof HTMLSpanElement)
		{
			return(element.textContent || "");
		}
		else if (element instanceof HTMLAnchorElement)
		{
			return(element.textContent || "");
		}

		else if (element instanceof HTMLImageElement)
		{
			return(element.alt || "");
		}

		else if (element instanceof HTMLObjectElement)
		{
			if (element.data)
				return(element.data);
			else if (element.getAttribute("data"))
				return(element.getAttribute("data") || "");
		}
	}


	getDateValue(element:HTMLInputElement) : Date
	{
		let date:Date = new Date(element.value);
		date.setHours(0, 0, 0, 0);
		return(date);
	}


	getDateTimeValue(element:HTMLInputElement) : Date
	{
		return(new Date(element.value));
	}


	public getTextAreaValue(element:HTMLTextAreaElement) : string
	{
		if (element instanceof HTMLTextAreaElement)
			return(element.value);

		return(null);
	}


	public getInputValue(element:HTMLInputElement) : any
	{
		if (element instanceof HTMLInputElement)
		{
			if (element.type == "number")
				return(this.getNumberValue(element));

			if (element.type == "range")
				return(this.getRangeValue(element));

			if (element.type == "radio")
				return(this.getRadioValue(element));

			if (element.type == "checkbox")
				return(this.getCheckBoxValue(element));

			if (element.type == "datetime-local" || element.type == "time")
				return(this.getDateTimeValue(element));

			if (element.type == "date" || element.type == "month" || element.type == "week")
				return(this.getDateValue(element));

			return(element.value);
		}
	}


	public getNumberValue(element:HTMLInputElement) : number
	{
		let num:number = parseFloat(element.value);
		if (isNaN(num)) return(null); else return(num);
	}


	public getRangeValue(element:HTMLInputElement) : number
	{
		let num:number = parseFloat(element.value);
		if (isNaN(num)) return(null); else return(num);
	}


	public getRadioValue(element:HTMLInputElement) : string
	{
		if (element.type == "radio")
		{
			let group:string = element.name;
			let radios:NodeListOf<HTMLInputElement> = document.querySelectorAll(`input[type="radio"][name="${group}"]`);

			for (let radio of radios)
			{
				if (radio.checked)
					return(radio.value);
			}
		}

		return(null);
	}


	public getCheckBoxValue(element:HTMLInputElement) : boolean
	{
		if (element.type == "checkbox")
			return(element.checked);
	}


	public getSelectValue(element:HTMLSelectElement) : string
	{
		if (element.multiple)
		{
			let values:string[] = [];
			for (let option of element.options)
			{
				if (option.selected)
					values.push(option.value);
			}
			return(values.join(","));
		}
		else
		{
			return(element.value);
		}
	}


	public setValue(element:HTMLElement, value:any) : void
	{
		if (element instanceof HTMLInputElement)
			return(this.setInputValue(element, value));

		if (element instanceof HTMLSelectElement)
			return(this.setSelectValue(element, value));

		if (element instanceof HTMLTextAreaElement)
			return(this.setTextAreaValue(element, value));

		if (element instanceof HTMLButtonElement || element instanceof HTMLLabelElement ||
				 element instanceof HTMLDivElement || element instanceof HTMLSpanElement ||
				 element instanceof HTMLAnchorElement)
		{
			element.textContent = value;
			return;
		}

		if (element instanceof HTMLImageElement)
		{
			element.alt = value;
			return;
		}

		if (element instanceof HTMLObjectElement)
		{
			if (element.data) element.data = value;
			else	element.setAttribute("data",value);
		}
	}


	public setInputValue(element:HTMLInputElement, value:any) : void
	{
		if (element instanceof HTMLInputElement)
		{
			if (element.type == "number")
			 return(this.setNumberValue(element, value));

			if (element.type == "range")
			 return(this.setRangeValue(element, value));

			if (element.type == "radio")
				return(this.setRadioValue(element, value));

			if (element.type == "checkbox")
				return(this.setCheckBoxValue(element, value));

			if (element.type == "time" || element.type == "datetime" || element.type == "datetime-local")
				return(this.setDateTimeValue(element, value));

			if (element.type == "Date" ||	element.type == "month" || element.type == "week")
				return(this.setDateValue(element, value));

			element.value = value;
		}
	}


	public setNumberValue(element:HTMLInputElement, value:number) : void
	{
		if (!isNaN(value))
			element.value = value.toString();
	}


	public setRangeValue(element:HTMLInputElement, value:number) : void
	{
		if (!isNaN(value))
			element.value = value.toString();
	}


	public setRadioValue(element:HTMLInputElement, value:boolean) : void
	{
		element.checked = value;
	}


	public setTextAreaValue(element:HTMLTextAreaElement, value:string) : void
	{
		element.value = value;
	}


	public setCheckBoxValue(element:HTMLInputElement, value:boolean) : void
	{
		element.checked = value;
	}


	public setSelectValue(element:HTMLSelectElement, value:string) : void
	{
		if (element.multiple)
		{
			let values:string[] = value.split(",");
			for (let option of element.options)
			{
				option.selected = values.includes(option.value);
			}
		}
		else
		{
			element.value = value;
		}
	}


	public setDateValue(element:HTMLInputElement, date:Date) : void
	{
		element.value = this.formatDate(date);
	}


	public setDateTimeValue(element:HTMLInputElement, date:Date) : void
	{
		element.value = this.formatDateTime(date);
 	}


	public formatDate(date:Date) : string
	{
		let day:string = date.getDate().toString().padStart(2, '0');
		let month:string = (date.getMonth() + 1).toString().padStart(2, '0');
		let year:string = date.getFullYear().toString();
		return(`${day}-${month}-${year}`);
	}


	public formatDateTime(date:Date) : string
	{
		let day:string = date.getDate().toString().padStart(2, '0');
		let month:string = (date.getMonth() + 1).toString().padStart(2, '0');
		let year:string = date.getFullYear().toString();
		let hours:string = date.getHours().toString().padStart(2, '0');
		let minutes:string = date.getMinutes().toString().padStart(2, '0');
		let seconds:string = date.getSeconds().toString().padStart(2, '0');
		return(`${day}-${month}-${year}  ${hours}:${minutes}:${seconds}`);
	}


	public front(element:HTMLElement) : void
	{
		element.style.zIndex = (++ViewMediator.zindex)+"";
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


	private change:number = 0;
	public AUTOCOMPLETEDELAY:number = 10; // milliseconds

	public detectAutoComplete() : boolean
	{
		let auto:boolean = false;

		if (Date.now() - this.change < this.AUTOCOMPLETEDELAY)
			auto = true;
		
		this.change = Date.now();
		return(auto);
	}
}