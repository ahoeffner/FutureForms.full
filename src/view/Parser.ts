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
import { From } from './tags/From.js';
import { Foreach } from './tags/Foreach.js';
import { CustomInput } from './tags/CustomInput.js';


export class Parser
{
   public get customtags() : Map<string,Tag>
   {
      let map:Map<string,Tag> = new Map<string,Tag>();
      map.set("custom-input",new CustomInput());
      return(map);
   }


   public get customattrs() : Map<string,Tag>
   {
      let map:Map<string,Tag> = new Map<string,Tag>();
      map.set("from",new From());
      map.set("foreach",new Foreach());
      return(map);
   }


   /**
    *
    * @param fr An element
    * @param to Another element
    * @returns The other element, but with all the original attributes
    */
	public copyAllAttributes(fr:Element,to:Element) : void
	{
		if (fr == null || to == null) return;
		let attrnames:string[] = fr.getAttributeNames();

		for (let an = 0; an < attrnames.length; an++)
			to.setAttribute(attrnames[an],fr.getAttribute(attrnames[an]));
	}


   /**
    * Parse and replace custom tags for the element
    * @param component The component that 'ownes' this piece of html
    * @param element The html element
    */
   public async parseContent(component?:any, element?:HTMLElement) : Promise<void>
   {
      if (element == null)
			element = document.body;

		if (!element.childNodes)
			return;

      let nodes:Node[] = [];
		element.childNodes.forEach((node) => {nodes.push(node)});

      for (let i = 0; i < nodes.length; i++)
      {
         if (nodes[i] instanceof HTMLElement)
         {
            let elem:HTMLElement = nodes[i] as HTMLElement;
            console.log("parse "+elem.tagName+" "+elem.getAttribute("name"))

            if (!this.parseElement(component,nodes[i]))
               this.parseContent(component,nodes[i] as HTMLElement);
         }
      }
   }


   public parseElement(component:any, element:Node, skip?:Tag[]) : boolean
   {
      let tag:Tag = null;
      let replace:HTMLElement|HTMLElement[] = null;

      if (!(element instanceof HTMLElement))
         return(false);

      tag = this.customtags.get(element.tagName.toLowerCase());
      if (skip && skip.indexOf(tag) >= 0) tag = null;

      if (tag)
      {
         console.log("resolve "+tag.constructor.name)
         replace = tag.replace(component,element);
         this.replace(component,element,replace);
         return(true);
      }


      let attrs:string[] = element.getAttributeNames();

      for (let i = 0; i < attrs.length; i++)
      {
         let attr:string = attrs[i];
         tag = this.customattrs.get(attr.toLowerCase());
         if (skip && skip.indexOf(tag) >= 0) tag = null;

         if (tag != null)
         {
            console.log("resolve "+tag.constructor.name)
            replace = tag.replace(component,element,attr);
            this.replace(component,element,replace);
            return(true);
         }
      }

      return(false);
   }


   private replace(component:any, element:HTMLElement, replace:HTMLElement|HTMLElement[]) : void
   {
      if (!replace)
         return;

      if (!Array.isArray(replace))
      {
         element.replaceWith(replace);
         this.parseContent(component,replace);
         return;
      }

      let next:HTMLElement = element;
      let prev:HTMLElement = element;

      for (let i = 0; i < replace.length; i++)
      {
         next.after(replace[i]);
         this.parseContent(component,replace[i]);
         next = replace[i];
      }

      prev.remove();
   }
}