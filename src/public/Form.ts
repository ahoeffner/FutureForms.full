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


import { Form as View} from "../view/Form.js";
import { Form as Model} from "../model/Form.js";


export class Form
{
	private view$:View;
	private model$:Model;


   constructor(view?:HTMLElement)
   {
      this.view$ = new View(this);
		this.model$ = new Model(this);

		this.model$.view = this.view$;
		this.view$.model = this.model$;

		if (view) this.setView(view);
   }


	public get name() : string
	{
		return(this.constructor.name);
	}


   public async setView(view:HTMLElement) : Promise<void>
   {
      await this.view$.setView(view);
   }


	public getView() : HTMLElement
	{
		return(this.view$.getView());
	}
}