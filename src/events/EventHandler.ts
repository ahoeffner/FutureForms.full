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

export class EventHandler implements EventListenerObject
{
   private defer$:boolean = false;

   private static deferable$:string[] =
   [
      "click",
      "focus", // Actually not listening for focus, but 'focusin' will be triggered
      "focusin"
   ]

   private static fkeys$:string[] =
   [
      'Tab',
      'Escape',
      'PageUp',
      'PageDown',
      'ArrowUp',
      'ArrowDown',
      'F1',
      'F2',
      'F3',
      'F4',
      'F5',
      'F6',
      'F7',
      'F8',
      'F9',
      'F10',
      'F11',
      'F12'
   ];


   /**
    * Add the necessary events
    */
   public static initialize() : void
   {
      let handler:EventHandler = new EventHandler();

		document.body.addEventListener("click",handler);
		document.body.addEventListener("input",handler);
		document.body.addEventListener("keydown",handler);
		document.body.addEventListener("focusin",handler);
   }


   private constructor() {};


   /**
    * @param event The event to be handles
    * @returns
    */
   public handleEvent(event:Event) : void
   {
      if (this.defer$ && EventHandler.deferable$.includes(event.type))
      {
         this.defer$ = false;
         return;
      }
   }


   /**
    * @param event The event to be deferred
    */
   public deferEvent(event:Event) : void
   {
      if (EventHandler.deferable$.includes(event.type))
         this.defer$ = true;
   }
}