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

import { Tag } from './tags/Tag.js';
import { Foreach } from './tags/Foreach.js';


export class Parser
{
   private static limit:number = 0;


   public get customtags() : Map<string,Tag>
   {
      return(new Map());
   }


   public get customattrs() : Map<string,Tag>
   {
      let map:Map<string,Tag> = new Map<string,Tag>();
      map.set("foreach",new Foreach());
      return(map);
   }


   public async parse(component?:any, element?:HTMLElement) : Promise<void>
   {
      console.log("parse "+element.tagName)
      if (!element) element = document.body;
      this.translate(component,element,[]);
   }


   private async translate(component:any, element:HTMLElement) : Promise<void>
   {
      if (element == null)
			return;

		if (!element.childNodes)
			return;

      if (++Parser.limit > 10) return;

      let nodes:Node[] = [];
		element.childNodes.forEach((node) => {nodes.push(node)});

      for (let i = 0; i < nodes.length; i++)
      {
         if (nodes[i] instanceof HTMLElement)
         {
            console.log("translate2 "+(nodes[i] as HTMLElement).tagName)

            if (!this.resolve(component,nodes[i]))
               this.translate(component,nodes[i] as HTMLElement);
         }
      }
   }


   private resolve(component:any, element:Node) : boolean
   {
      let tag:Tag = null;
      let resolved:Tag[] = [];
      let done:boolean = false;
      let replace:HTMLElement|HTMLElement[] = null;

      if (!(element instanceof HTMLElement))
         return(false);

      tag = this.customtags.get(element.tagName.toLowerCase());

      if (tag)
      {
         replace = tag.replace(component,element);
         this.replace(component,element,replace,resolved);
      }


      let attrs:string[] = element.getAttributeNames();

      for (let i = 0; i < attrs.length; i++)
      {
         let attr:string = attrs[i];
         tag = this.customattrs.get(attr.toLowerCase());

         if (resolved.indexOf(tag) >= 0)
            tag = null;

         if (tag != null)
         {
            resolved.push(tag);
            replace = tag.replace(component,element,attr);
            this.replace(component,element,replace,resolved);
         }
      }

      return(false);
   }


   private replace(component:any, element:HTMLElement, replace:HTMLElement|HTMLElement[], resolved:Tag[]) : void
   {
      if (!replace)
         return;

      if (!Array.isArray(replace))
      {
         element.replaceWith(replace);
         this.translate(component,replace,resolved);
         return;
      }

      let next:HTMLElement = element;
      let prev:HTMLElement = element;

      for (let i = 0; i < replace.length; i++)
      {
         next.after(replace[i]);
         this.translate(component,replace[i],resolved);
         next = replace[i];
      }

      prev.remove();
   }
}